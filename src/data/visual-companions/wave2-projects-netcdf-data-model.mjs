const text = (en, ko) => Object.freeze({ en, ko });

const phase = (id, title, question, example, reason, result) => Object.freeze({
  id,
  title: text(...title),
  question: text(...question),
  example: text(...example),
  reason: text(...reason),
  result: text(...result),
});

const domain = (id, label, discipline, shape, variables, question, output) => Object.freeze({
  id,
  label: text(...label),
  discipline: text(...discipline),
  shape: text(...shape),
  variables: text(...variables),
  question: text(...question),
  output: text(...output),
});

export const projectsNetCdfDataModelCompanion = Object.freeze({
  issue: '426',
  parentIssue: '418',
  repository: 'bluetape4k-projects',
  slug: 'projects-netcdf-data-model',
  sourceRevision: '8165a8989e0075e7c17c489bf3000bf41fef8232',
  manual: Object.freeze({
    en: '/manual/bluetape4k-projects/2.0/modules/bluetape4k-science/',
    ko: '/ko/manual/bluetape4k-projects/2.0/modules/bluetape4k-science/',
  }),
  title: text('NetCDF: One Container, Many Scientific Worlds', 'NetCDF: 하나의 컨테이너, 여러 과학 세계'),
  summary: text(
    'See how dimensions, variables, coordinates, and attributes turn one self-describing container into time series, maps, volumes, and domain-specific science products.',
    '차원, 변수, 좌표, 속성이 하나의 self-describing 컨테이너를 시계열, 지도, volume, 분야별 과학 산출물로 바꾸는 과정을 살펴봅니다.',
  ),
  model: Object.freeze({
    classic: text(
      'Classic model: dimensions, variables, and attributes form a portable array container.',
      'Classic model: dimension, variable, attribute가 이식 가능한 array container를 구성합니다.',
    ),
    enhanced: text(
      'Enhanced model: netCDF-4 adds groups, multiple unlimited dimensions, and user-defined types.',
      'Enhanced model: netCDF-4는 group, 여러 unlimited dimension, user-defined type을 추가합니다.',
    ),
    contract: text(
      'A file carries values together with the metadata needed to interpret their shape, units, and location.',
      '파일은 값과 함께 shape, 단위, 위치를 해석하는 데 필요한 metadata를 담습니다.',
    ),
  }),
  phases: Object.freeze([
    phase(
      'container',
      ['1 · Start with a self-describing container', '1 · Self-describing container에서 시작'],
      ['What must travel with the measurements?', '측정값과 함께 무엇이 이동해야 할까요?'],
      ['air_temperature.nc · global: title, institution, conventions', 'air_temperature.nc · global: title, institution, conventions'],
      ['A reader should discover context without a second schema file or a private naming convention.', 'reader가 별도 schema 파일이나 비공개 naming convention 없이 맥락을 발견할 수 있어야 합니다.'],
      ['File identity + global attributes establish the dataset story before any array is sliced.', '파일 identity와 global attribute가 array를 slice하기 전에 dataset의 맥락을 세웁니다.'],
    ),
    phase(
      'dimensions',
      ['2 · Let dimensions define the shape', '2 · Dimension으로 shape를 정의'],
      ['Which axes exist, and how long is each one?', '어떤 축이 있고 각 축의 길이는 얼마인가요?'],
      ['time=24 (unlimited), level=10, lat=90, lon=180', 'time=24 (unlimited), level=10, lat=90, lon=180'],
      ['Named dimensions make the same numbers meaningful across variables and enable appendable time axes.', '이름 있는 dimension은 여러 variable에서 같은 수치를 의미 있게 만들고 시간 축 append를 가능하게 합니다.'],
      ['Shape becomes a compact contract: [time, level, lat, lon] rather than an unexplained flat buffer.', 'shape가 설명 없는 flat buffer가 아니라 [time, level, lat, lon]이라는 간결한 계약이 됩니다.'],
    ),
    phase(
      'variables',
      ['3 · Store values as typed variables', '3 · Typed variable로 값을 저장'],
      ['What quantity is measured on those axes?', '그 축에서 어떤 양을 측정하나요?'],
      ['temperature: float [time, level, lat, lon] · units=K', 'temperature: float [time, level, lat, lon] · units=K'],
      ['Each variable couples a data type and N-dimensional values to the dimensions it uses.', '각 variable은 data type과 N-dimensional 값을 자신이 사용하는 dimension과 결합합니다.'],
      ['A reader can choose one variable, know its rank, and plan a slice without loading the whole file.', 'reader는 variable 하나를 선택하고 rank를 파악해 전체 파일을 읽지 않고 slice를 계획할 수 있습니다.'],
    ),
    phase(
      'coordinates',
      ['4 · Attach coordinates and meaning', '4 · Coordinate와 의미를 연결'],
      ['Where and when does each value belong?', '각 값은 어디에서 언제의 값인가요?'],
      ['lat(lat): degrees_north · lon(lon): degrees_east · time: hours since 2000-01-01', 'lat(lat): degrees_north · lon(lon): degrees_east · time: hours since 2000-01-01'],
      ['Coordinate variables, CF attributes, units, and auxiliary coordinates turn indexes into physical locations.', 'coordinate variable, CF attribute, 단위, auxiliary coordinate가 index를 물리적 위치로 바꿉니다.'],
      ['The same array can become a map, profile, or time series because its coordinates travel with it.', 'coordinate가 함께 이동하므로 같은 array가 지도, profile, 시계열이 될 수 있습니다.'],
    ),
    phase(
      'shapes',
      ['5 · Read the array as a scientific shape', '5 · Array를 과학적 shape로 읽기'],
      ['What does rank say about the question we can ask?', 'rank가 어떤 질문을 가능하게 하나요?'],
      ['1D series · 2D field · 3D time-space · 4D time-level-space cube', '1D series · 2D field · 3D time-space · 4D time-level-space cube'],
      ['Rank is not a domain label; it is a reusable arrangement of axes that many disciplines can share.', 'rank는 분야 이름이 아니라 여러 분야가 공유할 수 있는 재사용 가능한 축 배치입니다.'],
      ['Select, slice, aggregate, or resample the same container according to the scientific question.', '과학적 질문에 따라 같은 container를 select, slice, aggregate, resample할 수 있습니다.'],
    ),
    phase(
      'domains',
      ['6 · Map the same primitives to a domain', '6 · 같은 primitive를 분야에 매핑'],
      ['Which variables and coordinates answer this field’s question?', '이 분야의 질문에 답하는 variable과 coordinate는 무엇인가요?'],
      ['Weather: air temperature + pressure · Ocean: salinity + depth · Satellite: bands + geolocation', 'Weather: air temperature + pressure · Ocean: salinity + depth · Satellite: bands + geolocation'],
      ['The container stays stable while variable names, units, axes, and quality metadata express each discipline.', 'container는 안정적으로 유지되고 variable 이름, 단위, 축, 품질 metadata가 분야를 표현합니다.'],
      ['Interoperable readers can share a workflow while specialists keep domain-specific attributes and conventions.', '상호운용 reader는 workflow를 공유하면서도 전문가는 분야별 attribute와 convention을 유지합니다.'],
    ),
    phase(
      'use',
      ['7 · Turn a slice into an analysis', '7 · Slice를 분석으로 전환'],
      ['How does a scientist use the stored structure?', '과학자는 저장된 구조를 어떻게 활용하나요?'],
      ['query time window → select level → map / profile / section → compare or model', 'time window query → level select → map / profile / section → compare or model'],
      ['Explicit coordinates and units make a slice reproducible, explainable, and safe to pass to another tool.', '명시적인 coordinate와 단위는 slice를 재현 가능하고 설명 가능하게 하며 다른 도구로 안전하게 전달합니다.'],
      ['The result can feed visualization, statistics, simulation, data assimilation, or an archive without changing the file model.', '결과는 파일 모델을 바꾸지 않고 visualization, 통계, simulation, data assimilation, archive로 이어집니다.'],
    ),
  ]),
  visuals: Object.freeze([
    Object.freeze({
      phase: 'container',
      nodes: Object.freeze([
        Object.freeze({ id: 'file', label: text('dataset.nc', 'dataset.nc'), detail: text('self-describing file', 'self-describing file') }),
        Object.freeze({ id: 'global', label: text('global attributes', 'global attributes'), detail: text('title · institution · conventions', 'title · institution · conventions') }),
        Object.freeze({ id: 'groups', label: text('groups (enhanced)', 'groups (enhanced)'), detail: text('organize related variables', '관련 variable을 묶음') }),
      ]),
    }),
    Object.freeze({
      phase: 'dimensions',
      nodes: Object.freeze([
        Object.freeze({ id: 'time', label: text('time', 'time'), detail: text('24 · unlimited', '24 · unlimited') }),
        Object.freeze({ id: 'level', label: text('level', 'level'), detail: text('10 · fixed', '10 · fixed') }),
        Object.freeze({ id: 'space', label: text('lat × lon', 'lat × lon'), detail: text('90 × 180', '90 × 180') }),
      ]),
    }),
    Object.freeze({
      phase: 'variables',
      nodes: Object.freeze([
        Object.freeze({ id: 'temperature', label: text('temperature', 'temperature'), detail: text('float · [time, level, lat, lon]', 'float · [time, level, lat, lon]') }),
        Object.freeze({ id: 'pressure', label: text('pressure', 'pressure'), detail: text('float · units=hPa', 'float · units=hPa') }),
        Object.freeze({ id: 'quality', label: text('quality_flag', 'quality_flag'), detail: text('byte · ancillary', 'byte · ancillary') }),
      ]),
    }),
    Object.freeze({
      phase: 'coordinates',
      nodes: Object.freeze([
        Object.freeze({ id: 'lat-axis', label: text('lat', 'lat'), detail: text('degrees_north', 'degrees_north') }),
        Object.freeze({ id: 'lon-axis', label: text('lon', 'lon'), detail: text('degrees_east', 'degrees_east') }),
        Object.freeze({ id: 'time-axis', label: text('time', 'time'), detail: text('hours since 2000-01-01', 'hours since 2000-01-01') }),
      ]),
    }),
    Object.freeze({
      phase: 'shapes',
      nodes: Object.freeze([
        Object.freeze({ id: 'series', label: text('1D · series', '1D · series'), detail: text('[time]', '[time]') }),
        Object.freeze({ id: 'field', label: text('2D · field', '2D · field'), detail: text('[lat, lon]', '[lat, lon]') }),
        Object.freeze({ id: 'volume', label: text('3D · volume', '3D · volume'), detail: text('[level, lat, lon]', '[level, lat, lon]') }),
        Object.freeze({ id: 'cube', label: text('4D · cube', '4D · cube'), detail: text('[time, level, lat, lon]', '[time, level, lat, lon]') }),
      ]),
    }),
    Object.freeze({
      phase: 'domains',
      nodes: Object.freeze([
        Object.freeze({ id: 'atmosphere', label: text('atmosphere', 'atmosphere'), detail: text('temperature · pressure', 'temperature · pressure') }),
        Object.freeze({ id: 'ocean', label: text('ocean', 'ocean'), detail: text('salinity · depth', 'salinity · depth') }),
        Object.freeze({ id: 'surface', label: text('surface', 'surface'), detail: text('bands · quality', 'bands · quality') }),
      ]),
    }),
    Object.freeze({
      phase: 'use',
      nodes: Object.freeze([
        Object.freeze({ id: 'select', label: text('select', 'select'), detail: text('time · level · region', 'time · level · region') }),
        Object.freeze({ id: 'interpret', label: text('interpret', 'interpret'), detail: text('units · missing · quality', 'units · missing · quality') }),
        Object.freeze({ id: 'result', label: text('result', 'result'), detail: text('map · model · archive', 'map · model · archive') }),
      ]),
    }),
  ]),
  domains: Object.freeze([
    domain(
      'weather-climate',
      ['Weather & climate', '기상·기후'],
      ['Atmospheric state and long-running climate reanalysis', '대기 상태와 장기간 기후 재분석'],
      ['[time, level, lat, lon]', '[time, level, lat, lon]'],
      ['air_temperature, precipitation, pressure', 'air_temperature, precipitation, pressure'],
      ['Where will temperature or rainfall change across time, altitude, and location?', '시간·고도·위치에 따라 기온과 강수량은 어디에서 변할까요?'],
      ['forecast map · anomaly field · seasonal aggregate', '예보 지도 · anomaly field · 계절 aggregate'],
    ),
    domain(
      'ocean',
      ['Ocean & marine', '해양·해양과학'],
      ['Water-column observations and model output', '수층 관측과 해양 모델 산출물'],
      ['[time, depth, lat, lon]', '[time, depth, lat, lon]'],
      ['sea_surface_temperature, salinity, current_u', 'sea_surface_temperature, salinity, current_u'],
      ['How do temperature, salinity, or currents vary by depth and position?', '수심과 위치에 따라 수온, 염분, 해류는 어떻게 달라질까요?'],
      ['transect · vertical profile · eddy or current map', 'transect · 수직 profile · 소용돌이·해류 지도'],
    ),
    domain(
      'satellite',
      ['Satellite & remote sensing', '위성·원격 탐사'],
      ['Gridded sensor bands with geolocation and calibration metadata', 'geolocation과 calibration metadata를 갖는 센서 band grid'],
      ['[time, band, y, x] + geolocation', '[time, band, y, x] + geolocation'],
      ['reflectance_band_1, quality_flag, latitude, longitude', 'reflectance_band_1, quality_flag, latitude, longitude'],
      ['Which pixels and bands describe the observed surface, and how reliable are they?', '어떤 pixel과 band가 지표를 설명하고 그 품질은 어떤가요?'],
      ['false-color composite · cloud mask · calibrated swath or tile', 'false-color composite · cloud mask · 보정 swath·tile'],
    ),
    domain(
      'hydrology',
      ['Hydrology & environment', '수문·환경'],
      ['Watershed, soil, air-quality, and ecological measurements', '유역, 토양, 대기질, 생태 측정값'],
      ['[time, station] or [time, lat, lon]', '[time, station] 또는 [time, lat, lon]'],
      ['streamflow, soil_moisture, pm25, chlorophyll', 'streamflow, soil_moisture, pm25, chlorophyll'],
      ['How does a local measurement relate to a basin, grid cell, or observation period?', '지역 측정값은 유역, grid cell, 관측 기간과 어떤 관계인가요?'],
      ['basin summary · exceedance map · station time series', '유역 요약 · 초과값 지도 · 관측소 시계열'],
    ),
    domain(
      'geoscience',
      ['Geoscience & simulation', '지구과학·시뮬레이션'],
      ['Model ensembles, seismic volumes, and geophysical fields', 'model ensemble, seismic volume, geophysical field'],
      ['[ensemble, time, z, y, x]', '[ensemble, time, z, y, x]'],
      ['displacement, potential, wave_velocity, uncertainty', 'displacement, potential, wave_velocity, uncertainty'],
      ['Which slice, scenario, or ensemble member should be compared?', '어떤 slice, 시나리오, ensemble member를 비교해야 하나요?'],
      ['cross-section · uncertainty band · scenario comparison', '단면 · uncertainty band · 시나리오 비교'],
    ),
  ]),
  usage: Object.freeze([
    text('1 · Select by variable and coordinate metadata', '1 · Variable과 coordinate metadata로 선택'),
    text('2 · Slice the smallest useful time / level / region', '2 · 필요한 time / level / region만 최소 slice'),
    text('3 · Validate units, missing values, and quality flags', '3 · 단위, 결측값, quality flag 검증'),
    text('4 · Visualize, compare, model, or publish the derived result', '4 · 결과를 시각화·비교·모델링·공유'),
  ]),
  currentImplementation: Object.freeze({
    title: text('bluetape4k-science today', '현재 bluetape4k-science 범위'),
    detail: text(
      'The 2.0.0 catalog maps file metadata, variables, dimensions, global attributes, and bounded grid values; the importer currently supports rank 1–4, CF numeric auxiliary coordinates, selected CRS values, and resumable slices.',
      '2.0.0 catalog는 file metadata, variable, dimension, global attribute, bounded grid value를 매핑합니다. importer는 현재 rank 1–4, CF numeric auxiliary coordinate, 일부 CRS, 재개 가능한 slice를 다룹니다.',
    ),
    boundary: text(
      'This companion explains the general NetCDF model. It is not a claim that the current importer implements every NetCDF-4 feature or every scientific convention.',
      '이 자료는 일반 NetCDF 모델을 설명합니다. 현재 importer가 모든 NetCDF-4 기능이나 모든 과학 convention을 구현한다는 뜻은 아닙니다.',
    ),
  }),
  sources: Object.freeze([
    Object.freeze({ label: 'Unidata NetCDF Data Model', url: 'https://docs.unidata.ucar.edu/netcdf-c/current/netcdf_data_model.html' }),
    Object.freeze({ label: 'CF Conventions', url: 'https://cfconventions.org/cf-conventions/cf-conventions.html' }),
    Object.freeze({ label: 'Unidata netCDF-Java Grid Datasets', url: 'https://docs.unidata.ucar.edu/netcdf-java/dev/userguide/grid_datasets.html' }),
    Object.freeze({ label: 'NASA Earthdata Satellite Data Explorer', url: 'https://csdap.earthdata.nasa.gov/user-guide/' }),
    Object.freeze({ label: 'bluetape4k-science 2.0.0 README', url: 'https://github.com/bluetape4k/bluetape4k-projects/blob/8165a8989e0075e7c17c489bf3000bf41fef8232/utils/science/README.md' }),
  ]),
});
