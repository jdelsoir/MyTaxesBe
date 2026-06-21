/* Per-category explanatory content (NL/FR/EN). Grounded in the verified
   department→function mapping (pipeline/taxonomy-map.json) and ETL_FINDINGS.md.
   blurb = one-line "what it covers in Belgium"; covers = concrete examples;
   note = optional caveat. Department line items themselves come from the data. */
globalThis.CONTENT = {
  social_protection: {
    blurb: {
      nl: 'De bijdrage van de federale overheid aan de Belgische sociale zekerheid, plus steun voor mensen in nood.',
      fr: 'La participation de l’État fédéral à la sécurité sociale belge, plus l’aide aux personnes en difficulté.',
      en: 'The federal government’s payment into Belgium’s social security, plus support for people in need.' },
    covers: {
      nl: ['Pensioenen', 'Financiering ziekteverzekering (RIZIV)', 'Werkloosheid en kinderbijslag', 'Leefloon en OCMW-steun', 'Opvang van asielzoekers'],
      fr: ['Pensions', 'Financement de l’assurance maladie (INAMI)', 'Chômage et allocations familiales', 'Revenu d’intégration et aide des CPAS', 'Accueil des demandeurs d’asile'],
      en: ['Pensions', 'Health-insurance funding (INAMI/RIZIV)', 'Unemployment & family benefits', 'Minimum income & OCMW/CPAS aid', 'Reception of asylum seekers'] },
  },
  health: {
    blurb: {
      nl: 'Het federale gezondheidsbeleid en de veiligheid. De meeste zorg wordt via de sociale zekerheid betaald, dus deze post is klein.',
      fr: 'La politique fédérale de santé publique et de sécurité. La plupart des soins sont payés par la sécurité sociale, donc ce poste est petit.',
      en: 'Federal public-health policy and safety. Most medical care is paid through social security, so this line is small.' },
    covers: {
      nl: ['Voedselveiligheid (FAVV)', 'Ziekenhuisregelgeving', 'Geneesmiddelenbeleid (FAGG)', 'Voorbereiding op gezondheidscrises'],
      fr: ['Sécurité alimentaire (AFSCA)', 'Réglementation des hôpitaux', 'Politique du médicament (AFMPS)', 'Préparation aux crises sanitaires'],
      en: ['Food safety (FASFC/AFSCA)', 'Hospital regulation', 'Medicines policy (FAMHP)', 'Health-crisis preparedness'] },
    note: {
      nl: 'Je dokter- en ziekenhuiskosten zitten bij Sociale bescherming, niet hier.',
      fr: 'Vos soins médicaux sont financés via la Protection sociale, pas ici.',
      en: 'Your doctor and hospital bills are funded under Social protection, not here.' },
  },
  regions_communities: {
    blurb: {
      nl: 'Geld dat de federale overheid doorstort naar de Gewesten en Gemeenschappen, die veel dagelijkse diensten beheren.',
      fr: 'L’argent que l’État fédéral transfère aux Régions et Communautés, qui gèrent de nombreux services du quotidien.',
      en: 'Money the federal government transfers to the Regions and Communities, which run many day-to-day services.' },
    covers: {
      nl: ['Vlaamse, Franse en Duitstalige Gemeenschap', 'Gemeenschappelijke Gemeenschapscommissie (Brussel)', 'Financiering van onderwijs, cultuur en welzijn die lokaal worden geregeld'],
      fr: ['Communautés flamande, française et germanophone', 'Commission communautaire commune (Bruxelles)', 'Financement de l’enseignement, la culture et l’aide sociale gérés localement'],
      en: ['Flemish, French & German-speaking Communities', 'Common Community Commission (Brussels)', 'Funding for education, culture & welfare run locally'] },
  },
  debt_interest: {
    blurb: {
      nl: 'De rente die België op zijn staatsschuld betaalt. Het aflossen van de schuld zelf telt niet mee als uitgave.',
      fr: 'Les intérêts que la Belgique paie sur sa dette publique. Le remboursement de la dette elle-même n’est pas compté.',
      en: 'Interest Belgium pays on its national debt. Repaying the debt itself (rollover) is not counted as spending.' },
    covers: {
      nl: ['Rente op langlopende staatsobligaties', 'Rente op kortlopende schuld', 'Kosten van schuldbeheer'],
      fr: ['Intérêts sur les obligations à long terme', 'Intérêts sur la dette à court terme', 'Frais de gestion de la dette'],
      en: ['Interest on long-term government bonds', 'Interest on short-term debt', 'Debt-management costs'] },
  },
  defense: {
    blurb: {
      nl: 'De Belgische strijdkrachten en de internationale militaire engagementen.',
      fr: 'Les forces armées belges et les engagements militaires internationaux du pays.',
      en: 'The Belgian armed forces and the country’s international military commitments.' },
    covers: {
      nl: ['Land-, lucht- en marinecomponent', 'Personeel en militaire pensioenen', 'Uitrusting en operaties', 'NAVO-engagementen'],
      fr: ['Composantes terre, air et marine', 'Personnel et pensions militaires', 'Équipement et opérations', 'Engagements OTAN'],
      en: ['Army, air & naval components', 'Military personnel & pensions', 'Equipment & operations', 'NATO commitments'] },
  },
  justice: {
    blurb: {
      nl: 'Het gerechtelijk systeem: rechtbanken, rechters en gevangenissen.',
      fr: 'Le système judiciaire : tribunaux, juges et prisons.',
      en: 'The justice system: courts, judges and prisons.' },
    covers: {
      nl: ['Rechtbanken en magistraten', 'Gevangenissen en detentie', 'Juridische bijstand', 'Justitieadministratie'],
      fr: ['Tribunaux et magistrats', 'Prisons et détention', 'Aide juridique', 'Administration de la justice'],
      en: ['Courts & magistrates', 'Prisons & detention', 'Legal aid', 'Justice administration'] },
  },
  security_interior: {
    blurb: {
      nl: 'Het land veilig houden en de binnenlandse kerntaken beheren.',
      fr: 'Assurer la sécurité du pays et gérer les affaires intérieures.',
      en: 'Keeping the country safe and running its core internal affairs.' },
    covers: {
      nl: ['Federale politie', 'Civiele bescherming en brandweer', 'Crisiscentrum', 'Dienst Vreemdelingenzaken (asiel en migratie)', 'Organisatie van verkiezingen'],
      fr: ['Police fédérale', 'Protection civile et pompiers', 'Centre de crise', 'Office des étrangers (asile et migration)', 'Organisation des élections'],
      en: ['Federal police', 'Civil protection & fire services', 'Crisis centre', 'Immigration office (asylum & migration)', 'Organising elections'] },
  },
  mobility: {
    blurb: {
      nl: 'Vervoer, vooral steun aan het spoor.',
      fr: 'Les transports, dominés par le soutien au rail.',
      en: 'Transport, dominated by support for the railways.' },
    covers: {
      nl: ['Spoorsubsidies (NMBS en Infrabel)', 'Beleid voor weg, lucht en zee', 'Verkeersveiligheid en regelgeving'],
      fr: ['Subsides ferroviaires (SNCB et Infrabel)', 'Politique routière, aérienne et maritime', 'Sécurité et régulation des transports'],
      en: ['Rail subsidies (SNCB/NMBS & Infrabel)', 'Road, air & maritime policy', 'Transport safety & regulation'] },
  },
  finance_admin: {
    blurb: {
      nl: 'Belastingen innen en de federale administratie laten draaien.',
      fr: 'Percevoir les impôts et faire fonctionner l’administration fédérale.',
      en: 'Collecting taxes and running the federal administration.' },
    covers: {
      nl: ['Belastingdienst (FOD Financiën)', 'ICT, HR en loon van de overheid (BOSA)', 'Federale gebouwen (Regie der Gebouwen)', 'Eenmalige fondsen en provisies'],
      fr: ['Administration fiscale (SPF Finances)', 'Informatique, RH et paie publique (BOSA)', 'Bâtiments fédéraux (Régie des Bâtiments)', 'Fonds et provisions ponctuels'],
      en: ['Tax authority (FPS Finance)', 'Public-service IT, HR & payroll (BOSA)', 'Federal buildings (Buildings Agency)', 'One-off funds & provisions'] },
    note: {
      nl: 'Hoog in 2024 door eenmalige posten (garantiefonds, provisies Oekraïne en indexering) — geen gewone overhead.',
      fr: 'Élevé en 2024 à cause de postes ponctuels (fonds de garantie, provisions Ukraine et indexation) — pas des frais courants.',
      en: 'Large in 2024 due to one-off items (deposit-guarantee fund, Ukraine & indexation provisions) — not routine overhead.' },
  },
  foreign_eu: {
    blurb: {
      nl: 'De plaats van België in de wereld en zijn EU-lidmaatschap.',
      fr: 'La place de la Belgique dans le monde et son adhésion à l’UE.',
      en: 'Belgium’s place in the world and its EU membership.' },
    covers: {
      nl: ['Diplomatie en ambassades', 'Ontwikkelingssamenwerking', 'Belgische bijdrage aan de Europese Unie'],
      fr: ['Diplomatie et ambassades', 'Coopération au développement', 'Contribution de la Belgique à l’Union européenne'],
      en: ['Diplomacy & embassies', 'Development cooperation', 'Belgium’s contribution to the European Union'] },
  },
  economy_work_science: {
    blurb: {
      nl: 'Steun aan de economie, federaal arbeidsbeleid en wetenschap.',
      fr: 'Le soutien à l’économie, la politique fédérale de l’emploi et la science.',
      en: 'Support for the economy, federal labour policy and science.' },
    covers: {
      nl: ['Economie, kmo’s en energieregulering', 'Federale werkgelegenheid en arbeidsrelaties', 'Wetenschapsbeleid (Belspo, onderzoeksinstellingen, ESA/ruimtevaart)'],
      fr: ['Économie, PME et régulation de l’énergie', 'Emploi fédéral et relations de travail', 'Politique scientifique (Belspo, instituts de recherche, ESA/spatial)'],
      en: ['Economy, SMEs & energy regulation', 'Federal employment & labour relations', 'Science policy (Belspo, research institutes, ESA/space)'] },
  },
  democratic_institutions: {
    blurb: {
      nl: 'De instellingen van de Belgische democratie en de monarchie.',
      fr: 'Les institutions de la démocratie belge et la monarchie.',
      en: 'The institutions of Belgian democracy and the monarchy.' },
    covers: {
      nl: ['Federaal parlement (Kamer en Senaat)', 'De monarchie (Civiele Lijst en dotaties)', 'Grondwettelijk Hof en Rekenhof', 'Onafhankelijke organen (ombudsmannen, GBA)', 'Kanselarij van de premier'],
      fr: ['Parlement fédéral (Chambre et Sénat)', 'La monarchie (Liste civile et dotations)', 'Cour constitutionnelle et Cour des comptes', 'Organes indépendants (médiateurs, APD)', 'Chancellerie du Premier ministre'],
      en: ['Federal Parliament (Chamber & Senate)', 'The monarchy (Civil List & royal endowments)', 'Constitutional Court & Court of Audit', 'Independent bodies (ombudsmen, data-protection authority)', 'Prime Minister’s Chancellery'] },
  },
};
