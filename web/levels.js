/* Government-level explainers (NL/FR/EN). Competences verified 3-0 via deep-research
   (belgium.be, EU Committee of the Regions, be.brussels, CFWB). Communities have NO
   own tax — funded by federal transfers (Special Financing Act 1989). Curative care
   is federal; Communities cover PREVENTIVE health only. */
globalThis.LEVELS = {
  federal: {
    icon: 'landmark', color: '#c8102e',
    label: { nl: 'Federaal', fr: 'Fédéral', en: 'Federal' },
    blurb: {
      nl: 'De federale staat: sociale zekerheid, gezondheidszorg, justitie, defensie — en de grootste belastingen.',
      fr: 'L’État fédéral : sécurité sociale, soins de santé, justice, défense — et les principaux impôts.',
      en: 'The federal state: social security, healthcare, justice, defence — and the main taxes.' },
    taxes: {
      nl: ['Personenbelasting (basis)', 'Vennootschapsbelasting', 'Btw en accijnzen', 'Sociale bijdragen'],
      fr: ['Impôt des personnes physiques (base)', 'Impôt des sociétés', 'TVA et accises', 'Cotisations sociales'],
      en: ['Personal income tax (base)', 'Corporate tax', 'VAT and excise', 'Social contributions'] },
    spends: {
      nl: ['Sociale zekerheid en pensioenen', 'Ziekteverzekering (curatieve zorg)', 'Justitie en federale politie', 'Defensie en buitenlandse zaken', 'Rente op de staatsschuld', 'Spoor (NMBS)'],
      fr: ['Sécurité sociale et pensions', 'Assurance maladie (soins curatifs)', 'Justice et police fédérale', 'Défense et affaires étrangères', 'Intérêts de la dette publique', 'Rail (SNCB)'],
      en: ['Social security and pensions', 'Health insurance (curative care)', 'Justice and federal police', 'Defence and foreign affairs', 'Interest on the national debt', 'Rail (SNCB/NMBS)'] },
    funding: {
      nl: 'Int de grootste belastingen en stort een deel door naar de gewesten en gemeenschappen.',
      fr: 'Perçoit les principaux impôts et en reverse une partie aux régions et communautés.',
      en: 'Collects the main taxes and passes part on to the regions and communities.' },
  },
  region: {
    icon: 'map', color: '#1d3461',
    label: { nl: 'Gewest', fr: 'Région', en: 'Region' },
    blurb: {
      nl: 'De gewesten (Vlaanderen, Wallonië, Brussel): economie, milieu, mobiliteit en wonen — gebonden aan het grondgebied.',
      fr: 'Les régions (Flandre, Wallonie, Bruxelles) : économie, environnement, mobilité et logement — liées au territoire.',
      en: 'The regions (Flanders, Wallonia, Brussels): economy, environment, mobility and housing — tied to the territory.' },
    taxes: {
      nl: ['Gewestelijke opcentiemen op de personenbelasting', 'Registratierechten (vastgoed)', 'Erf- en schenkbelasting', 'Verkeersbelasting', 'Belasting op inverkeerstelling (BIV)'],
      fr: ['Additionnels régionaux à l’impôt des personnes physiques', 'Droits d’enregistrement (immobilier)', 'Droits de succession et de donation', 'Taxe de circulation', 'Taxe de mise en circulation (TMC)'],
      en: ['Regional surcharge on personal income tax', 'Registration duties (real estate)', 'Inheritance & gift duties', 'Road tax', 'Vehicle registration tax (TMC/BIV)'] },
    spends: {
      nl: ['Economie en werk', 'Milieu, water en natuur', 'Energie', 'Openbare werken en mobiliteit (geen spoor)', 'Wonen en ruimtelijke ordening', 'Landbouw en visserij', 'Toezicht op de gemeenten'],
      fr: ['Économie et emploi', 'Environnement, eau et nature', 'Énergie', 'Travaux publics et mobilité (hors rail)', 'Logement et aménagement du territoire', 'Agriculture et pêche', 'Tutelle sur les communes'],
      en: ['Economy and employment', 'Environment, water and nature', 'Energy', 'Public works and mobility (except rail)', 'Housing and spatial planning', 'Agriculture and fisheries', 'Oversight of the communes'] },
    funding: {
      nl: 'Eigen belastingen en opcentiemen, aangevuld met federale dotaties.',
      fr: 'Impôts et additionnels propres, complétés par des dotations fédérales.',
      en: 'Own taxes and surcharges, topped up by federal transfers.' },
  },
  community: {
    icon: 'users', color: '#7a5195',
    label: { nl: 'Gemeenschap', fr: 'Communauté', en: 'Community' },
    blurb: {
      nl: 'De gemeenschappen (Vlaamse, Franse, Duitstalige): onderwijs, cultuur en welzijn — gebonden aan personen en taal.',
      fr: 'Les communautés (flamande, française, germanophone) : enseignement, culture et aide aux personnes — liées aux personnes et à la langue.',
      en: 'The communities (Flemish, French, German-speaking): education, culture and welfare — tied to people and language.' },
    taxes: {
      nl: ['Geen eigen belastingen'],
      fr: ['Aucun impôt propre'],
      en: ['No own taxes'] },
    spends: {
      nl: ['Onderwijs en opleiding', 'Cultuur en media', 'Taalgebruik', 'Welzijn, gezin en jeugd', 'Preventieve gezondheidszorg'],
      fr: ['Enseignement et formation', 'Culture et médias', 'Emploi des langues', 'Aide aux personnes, familles et jeunesse', 'Santé préventive'],
      en: ['Education and training', 'Culture and media', 'Use of languages', 'Welfare, family and youth', 'Preventive health'] },
    funding: {
      nl: 'Heeft géén eigen belastingen — wordt gefinancierd door federale dotaties, berekend op gedeelde btw- en personenbelasting (Financieringswet 1989). Hun uitgaven betaal je dus via federaal geld.',
      fr: 'N’a aucun impôt propre — financée par des dotations fédérales calculées sur la TVA et l’IPP partagés (Loi de financement 1989). Vous financez donc leurs dépenses via l’argent fédéral.',
      en: 'Has no own taxes — funded by federal transfers based on shared VAT and income tax (Special Financing Act 1989). So you fund its spending through federal money.' },
    noTax: true,
  },
  commune: {
    icon: 'house', color: '#007068',
    label: { nl: 'Gemeente', fr: 'Commune', en: 'Commune' },
    blurb: {
      nl: 'De gemeenten (581): de dienstverlening het dichtst bij de burger.',
      fr: 'Les communes (581) : les services les plus proches du citoyen.',
      en: 'The communes (581): the services closest to the citizen.' },
    taxes: {
      nl: ['Aanvullende gemeentebelasting op de personenbelasting (~0–9%)', 'Opcentiemen op de onroerende voorheffing', 'Lokale heffingen'],
      fr: ['Taxe communale additionnelle à l’IPP (~0–9 %)', 'Centimes additionnels au précompte immobilier', 'Taxes locales'],
      en: ['Additional communal tax on income tax (~0–9%)', 'Surcharge on the property withholding tax', 'Local levies'] },
    spends: {
      nl: ['Lokale politie en brandweer', 'Lokale wegen en afval', 'Burgerlijke stand en bevolking', 'Verkiezingen', 'Stedenbouwkundige vergunningen', 'OCMW — sociale steun', 'Gemeentescholen'],
      fr: ['Police locale et pompiers', 'Voiries locales et déchets', 'État civil et population', 'Élections', 'Permis d’urbanisme', 'CPAS — aide sociale', 'Écoles communales'],
      en: ['Local police and fire service', 'Local roads and waste', 'Civil registry and population', 'Elections', 'Planning permission', 'CPAS/OCMW — social aid', 'Municipal schools'] },
    funding: {
      nl: 'Eigen belastingen (vooral de aanvullende personenbelasting) plus dotaties van het gewest.',
      fr: 'Impôts propres (surtout la taxe additionnelle à l’IPP) et dotations de la région.',
      en: 'Own taxes (mainly the additional income tax) plus transfers from the region.' },
  },
};
