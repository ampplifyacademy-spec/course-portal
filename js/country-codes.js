const COUNTRY_CODES = [
  ['SA','Saudi Arabia','966'],['AE','United Arab Emirates','971'],['QA','Qatar','974'],['KW','Kuwait','965'],
  ['BH','Bahrain','973'],['OM','Oman','968'],['EG','Egypt','20'],['JO','Jordan','962'],['LB','Lebanon','961'],
  ['IQ','Iraq','964'],['YE','Yemen','967'],['SY','Syria','963'],['PS','Palestine','970'],['MA','Morocco','212'],
  ['DZ','Algeria','213'],['TN','Tunisia','216'],['LY','Libya','218'],['SD','Sudan','249'],
  ['US','United States','1'],['CA','Canada','1'],['GB','United Kingdom','44'],['IE','Ireland','353'],
  ['FR','France','33'],['DE','Germany','49'],['ES','Spain','34'],['PT','Portugal','351'],['IT','Italy','39'],
  ['NL','Netherlands','31'],['BE','Belgium','32'],['CH','Switzerland','41'],['AT','Austria','43'],
  ['SE','Sweden','46'],['NO','Norway','47'],['DK','Denmark','45'],['FI','Finland','358'],['PL','Poland','48'],
  ['GR','Greece','30'],['TR','Turkey','90'],['RU','Russia','7'],['UA','Ukraine','380'],
  ['IN','India','91'],['PK','Pakistan','92'],['BD','Bangladesh','880'],['LK','Sri Lanka','94'],
  ['NP','Nepal','977'],['AF','Afghanistan','93'],['CN','China','86'],['JP','Japan','81'],['KR','South Korea','82'],
  ['HK','Hong Kong','852'],['TW','Taiwan','886'],['SG','Singapore','65'],['MY','Malaysia','60'],
  ['ID','Indonesia','62'],['TH','Thailand','66'],['VN','Vietnam','84'],['PH','Philippines','63'],
  ['MM','Myanmar','95'],['KH','Cambodia','855'],['AU','Australia','61'],['NZ','New Zealand','64'],
  ['ZA','South Africa','27'],['NG','Nigeria','234'],['KE','Kenya','254'],['GH','Ghana','233'],
  ['ET','Ethiopia','251'],['TZ','Tanzania','255'],['UG','Uganda','256'],
  ['BR','Brazil','55'],['MX','Mexico','52'],['AR','Argentina','54'],['CO','Colombia','57'],['CL','Chile','56'],
  ['PE','Peru','51'],['IL','Israel','972'],['IR','Iran','98'],['CZ','Czechia','420'],['RO','Romania','40'],
  ['HU','Hungary','36'],['BG','Bulgaria','359'],['RS','Serbia','381'],['HR','Croatia','385']
];

function populateCountrySelect(selectEl, defaultIso) {
  selectEl.innerHTML = COUNTRY_CODES.map(([iso, name, code]) =>
    `<option value="${code}" data-iso="${iso}" ${iso === defaultIso ? 'selected' : ''}>+${code} ${name}</option>`
  ).join('');
}
