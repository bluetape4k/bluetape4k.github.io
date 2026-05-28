# Reducing CSV Parser Allocations with Okio Segments

`bluetape4k-projects`의 `bluetape4k-csv` 모듈은 원래 `Reader` 기반 CSV lexer를 사용했다.
구조는 단순하고 정확했지만, 큰 CSV를 읽을 때 모든 문자를 `Reader`에서 decode한 뒤
`StringBuilder`에 누적하고 다시 field 문자열로 만드는 흐름이었다.

Issue [#651](https://github.com/bluetape4k/bluetape4k-projects/issues/651)의 목표는 이 경로의
allocation을 줄이고, 특히 큰 CSV workload에서 throughput을 끌어올리는 것이었다. 결론부터 말하면
Okio segment와 read-only `UnsafeCursor`를 사용한 UTF-8 fast path가 가장 효과적이었다.

![CSV Okio benchmark speedup](/assets/csv-okio-benchmark-speedup-01.png)

## Starting Point

기존 public entrypoint는 그대로 유지했다.

```kotlin
CsvRecordReader()
    .read(input, UTF_8, skipHeaders = true)
    .count()
```

내부 구현은 `CsvLexer`가 `Reader`를 받고, CSV 상태 기계가 한 문자씩 읽으면서 field를 만든다.
이 방식은 charset 처리와 fallback에는 좋지만 UTF-8 CSV가 대부분인 대량 처리 경로에서는 불리하다.

이번 작업의 boundary는 명확했다.

- public API는 바꾸지 않는다.
- UTF-8, ASCII delimiter/quote, doubled-quote escaping만 fast path로 처리한다.
- 그 외 charset이나 설정은 기존 `CsvLexer`로 fallback한다.
- whole-file materialization은 하지 않는다.

## Implementation Path

첫 번째 아이디어는 `InputStream`을 Okio `BufferedSource`로 감싸고, field payload를 Okio `Buffer`에
쌓은 다음 field가 끝날 때 한 번만 UTF-8 문자열로 decode하는 것이었다.

```kotlin
OkioCsvLexer(input.source().buffer(), settings, skipHeaders)
```

이것만으로도 “문자 단위 decode 후 append” 경로는 피할 수 있다. 하지만 단순 byte loop는 정확성은
좋았지만 성능 개선폭이 작았다. large lexer 기준으로는 약 22% 개선에 그쳤다.

두 번째 실험은 Okio의 segment 구조를 더 직접 활용하는 것이었다. `Buffer.UnsafeCursor`는 내부 segment
byte array를 read-only로 순회할 수 있다. 이름 그대로 조심해서 써야 하지만, 이번 케이스에서는
structural byte인 delimiter, quote, CR, LF만 찾으면 되므로 잘 맞았다.

최종 구현은 다음 형태다.

```kotlin
private fun findTerminatorOffset(terminators: ByteString): Long {
    source.buffer.readUnsafe().use { cursor ->
        while (cursor.next() != -1) {
            val data = cursor.data ?: continue
            var index = cursor.start
            while (index < cursor.end) {
                if (isTerminator(data[index], terminators)) {
                    return cursor.offset + index - cursor.start
                }
                index++
            }
        }
    }
    return -1L
}
```

조금 더 일반화하면, Okio `Buffer` 안에서 여러 delimiter 후보 중 첫 위치를 찾는 helper는 다음처럼
쓸 수 있다. 핵심은 `readUnsafe()`로 얻은 cursor를 `use`로 닫고, `cursor.start until cursor.end`
범위만 읽는 것이다. `cursor.data`는 segment 내부 배열이므로 수정하지 않는다.

```kotlin
private fun Buffer.indexOfAnyByteUnsafe(targets: ByteArray): Long {
    readUnsafe().use { cursor ->
        while (cursor.next() != -1) {
            val data = cursor.data ?: continue
            var index = cursor.start
            while (index < cursor.end) {
                if (data[index] in targets) {
                    return cursor.offset + index - cursor.start
                }
                index++
            }
        }
    }
    return -1L
}
```

중요한 점은 cursor를 write 용도로 쓰지 않았다는 것이다. source buffer의 segment를 읽기만 하고,
terminator 앞 payload는 `fieldBuffer.write(source.buffer, offset)`로 옮긴다. 그래서 scan은
segment 위에서 빠르게 하고, field decode는 field가 끝난 뒤 한 번만 수행한다.

## Behavior Guardrails

`UnsafeCursor`는 성능 도구이지 parser semantics를 바꿔도 되는 면허가 아니다. 그래서 기존
`CsvLexer`와 결과가 같은지를 직접 잠갔다.

```kotlin
parseWithOkio(csv) shouldBeEqualTo parseWithReader(csv)
```

특히 `extra_words.csv`처럼 실제 fixture에 가까운 큰 CSV 파일을 통째로 비교했다. 이 fixture는
세그먼트 경계 근처의 quote, null field, 긴 한국어 payload를 함께 검증한다. 단순 happy-path CSV만
통과하는 최적화는 여기서 걸러진다.

추가로 `maxCharsPerColumn`도 확인했다. fast scan이 terminator를 찾으려고 무한정 읽어버리면
large field guard가 약해지므로, scanned segment를 field buffer로 옮길 때 byte bound를 검사하고
최종 decode 후 문자 길이도 다시 검사한다.

## Benchmark Setup

벤치마크는 `bluetape4k-csv`의 `CsvParserBenchmark`에서 실행했다.

```bash
./gradlew :bluetape4k-csv:testBenchmark
```

workload는 세 가지다.

| Workload | Input |
|---|---|
| small | `product_type.csv`의 첫 10 KiB |
| medium | `product_type.csv` 전체 |
| large | `product_type.csv`를 16회 반복 결합 |

측정 단위는 JMH throughput `ops/s`다. 높을수록 좋다.

## Public Reader Result

가장 중요한 값은 public API인 `CsvRecordReader.read(...)` 경로다. UTF-8 CSV와 기본 설정에서는 새
Okio fast path를 탄다.

| Benchmark | Reader baseline | Okio fast path | Speedup |
|---|---:|---:|---:|
| `nativeCsvRead_small` | 20,173.731 ops/s | 45,417.110 ops/s | 2.25x |
| `nativeCsvRead_medium` | 296.944 ops/s | 683.434 ops/s | 2.30x |
| `nativeCsvRead_large` | 17.312 ops/s | 40.115 ops/s | 2.32x |

small, medium, large 모두 2.25-2.32배 범위로 개선됐다. small workload에서도 빨라진 이유는
char-by-char decode와 `StringBuilder` append를 피하고, structural scan을 segment byte array 위에서
끝내기 때문이다.

## Lexer-Level Comparison

public reader 결과가 우연인지 확인하려면 내부 lexer끼리도 비교해야 한다. 같은 input을 기존
`CsvLexer`와 새 `OkioCsvLexer`로 각각 직접 읽었다.

| Benchmark | Existing `CsvLexer` | `OkioCsvLexer` | Speedup |
|---|---:|---:|---:|
| `nativeLexer_small` | 21,043.679 ops/s | 45,062.565 ops/s | 2.14x |
| `nativeLexer_medium` | 288.105 ops/s | 668.457 ops/s | 2.32x |
| `nativeLexer_large` | 17.996 ops/s | 41.484 ops/s | 2.31x |

두 표가 같은 방향을 가리킨다. 개선은 `CsvRecordReader` wrapper에서 생긴 착시가 아니라 lexer 자체의
입력 처리 방식에서 나온다.

## What Did Not Ship

`BufferedSource.indexOfElement()`도 후보였다. API는 안전하고 코드도 짧다. 하지만 `BufferedSource`
레벨의 탐색은 필요 이상으로 upstream을 읽을 수 있고, 실험 중 큰 fixture equivalence를 깨뜨리는
경로가 있었다. 이 PR에서는 채택하지 않았다.

단순 Okio byte loop도 제외했다. 정확성은 좋았지만 large lexer가 17.481 -> 21.290 ops/s 정도였고,
사용자가 기대한 “Okio segment의 장점”을 충분히 쓰지 못했다.

최종 선택은 read-only `UnsafeCursor`였다. 위험한 API를 쓰되, 사용 범위를 structural-byte scan으로
좁히고 큰 fixture equivalence test로 잠그는 쪽이 가장 낫다고 판단했다.

## Next Candidate: Okio CSV Writer

읽기 최적화를 끝낸 뒤 자연스럽게 보이는 다음 후보는 대량 데이터를 CSV로 저장하는 pipeline이다.
`bluetape4k-csv`에는 이미 `FlowCsvWriter.writeFile(rows: Flow<Iterable<*>>)` 형태가 있어서 API는
streaming에 가깝다. 다만 내부는 `OutputStreamWriter`와 `Writer.write(...)` 중심이다.

UTF-8 파일 저장 경로라면 `BufferedSink` 기반 fast path를 둘 수 있다. 행 단위로 `String`을 크게
만들지 않고, delimiter/quote/line separator를 byte로 쓰고, 필드 payload만 필요한 시점에 UTF-8로
sink에 밀어 넣는 방식이다.

```kotlin
suspend fun writeCsvFileWithOkio(
    path: Path,
    rows: Flow<Iterable<*>>,
    delimiter: Byte = ','.code.toByte(),
    quote: Byte = '"'.code.toByte(),
): Long = withContext(Dispatchers.IO) {
    var count = 0L
    path.sink().buffer().use { sink ->
        rows.collect { row ->
            var first = true
            for (field in row) {
                if (!first) sink.writeByte(delimiter.toInt())
                first = false

                val value = field?.toString()
                if (value != null) {
                    sink.writeByte(quote.toInt())
                    for (ch in value) {
                        if (ch == '"') sink.writeUtf8("\"\"") else sink.writeUtf8CodePoint(ch.code)
                    }
                    sink.writeByte(quote.toInt())
                }
            }
            sink.writeUtf8("\n")
            count++
        }
    }
    count
}
```

이 코드는 블로그용 sketch다. 실제 구현은 기존 `DelimitedWriter`의 null/empty-string roundtrip,
`quoteAll`, TSV delimiter, charset fallback, close/flush semantics를 그대로 지켜야 한다. 그래도
방향은 명확하다. 읽기에서는 `BufferedSource`와 `UnsafeCursor`가 allocation을 줄였고, 쓰기에서는
`BufferedSink`가 row pipeline의 중간 `String`과 작은 `Writer.write` 호출을 줄일 가능성이 있다.

## Source Links

- Issue: [#651 perf(csv): reduce large CSV parsing allocations](https://github.com/bluetape4k/bluetape4k-projects/issues/651)
- PR: [#673 perf(csv): scan UTF-8 fields with Okio segments](https://github.com/bluetape4k/bluetape4k-projects/pull/673)
- Follow-up: [#674 perf(csv): add Okio BufferedSink fast path for writer pipelines](https://github.com/bluetape4k/bluetape4k-projects/issues/674)
- Main implementation: [`OkioCsvLexer`](https://github.com/bluetape4k/bluetape4k-projects/blob/develop/io/csv/src/main/kotlin/io/bluetape4k/csv/internal/OkioCsvLexer.kt)
- Benchmarks: [`CsvParserBenchmark`](https://github.com/bluetape4k/bluetape4k-projects/blob/develop/io/csv/src/test/kotlin/io/bluetape4k/csv/benchmark/CsvParserBenchmark.kt)
- Behavior tests: [`OkioCsvLexerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/develop/io/csv/src/test/kotlin/io/bluetape4k/csv/internal/OkioCsvLexerTest.kt)

## Closing

이번 작업의 핵심은 “Okio를 쓴다”가 아니라 “Okio의 segment 모델을 어디까지 안전하게 끌어올 수
있는가”였다. 단순 wrapper만으로는 부족했고, unbounded scan은 조심해야 했다. read-only
`UnsafeCursor`는 부담이 있는 선택이지만, fixture equivalence와 size guard를 같이 두면 CSV 구조
스캔에는 충분히 실용적인 도구가 된다.
