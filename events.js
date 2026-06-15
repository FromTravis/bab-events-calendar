const DEFAULT_EVENTS = [
  {
    "title": "Fêtes de Bayonne 2026",
    "date": "2026-07-29",
    "time": "12:00",
    "location": "Bayonne",
    "venue": "Centre-ville de Bayonne",
    "description": "Les célèbres Fêtes de Bayonne ! Cinq jours de liesse populaire, de musique, de défilés de chars, de pelote basque, de feux d'artifice et de traditions, où tout le monde s'habille en blanc et rouge. Un événement incontournable du Pays Basque.",
    "category": "Culture & Heritage",
    "url": "https://www.bayonne.fr",
    "image": "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Biarritz Surf Festival",
    "date": "2026-07-10",
    "time": "09:00",
    "location": "Biarritz",
    "venue": "Grande Plage & Côte des Basques",
    "description": "Le Biarritz Surf Festival célèbre la culture surf historique du Pays Basque. Compétitions de longboard, démonstrations de surf traditionnel basque, concerts sur la plage, projections de films de surf et village d'exposants éco-responsables.",
    "category": "Sports & Surf",
    "url": "https://www.biarritz.fr",
    "image": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Les Casetas de Biarritz",
    "date": "2026-06-24",
    "time": "18:00",
    "location": "Biarritz",
    "venue": "Côte des Basques",
    "description": "Rendez-vous festif incontournable de début d'été à Biarritz. Les pieds dans le sable, profitez des restaurants éphémères (casetas), de la musique live de groupes locaux et de DJs, et admirez le plus beau coucher de soleil de la côte basque.",
    "category": "Gastronomy & Markets",
    "url": "https://tourisme.biarritz.fr",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Anglet Beach Rugby Festival",
    "date": "2026-07-24",
    "time": "10:00",
    "location": "Anglet",
    "venue": "Plage des Sables d'Or",
    "description": "Le plus grand tournoi de beach rugby d'Europe. Des équipes masculines, féminines et mixtes se rencontrent dans une ambiance festive sur le sable d'Anglet. Animations gratuites, initiations, restauration et soirées musicales sur la plage.",
    "category": "Sports & Surf",
    "url": "https://www.anglet.fr",
    "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Marché Nocturne des Halles",
    "date": "2026-06-17",
    "time": "19:00",
    "location": "Biarritz",
    "venue": "Halles de Biarritz",
    "description": "Chaque mercredi soir de l'été, le quartier des Halles s'anime. Les commerçants vous proposent des dégustations de produits locaux basques (jambon de Bayonne, fromage de brebis Ossau-Iraty, gâteau basque) dans une ambiance guinguette chaleureuse.",
    "category": "Gastronomy & Markets",
    "url": "https://www.biarritz.fr",
    "image": "https://images.unsplash.com/photo-1488459718432-36b85e087386?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Sunset Yoga sur la Plage",
    "date": "2026-06-16",
    "time": "19:30",
    "location": "Anglet",
    "venue": "Plage de la Madrague",
    "description": "Venez vous détendre et vous ressourcer face à l'océan lors d'une séance de yoga au coucher du soleil. Adapté à tous les niveaux, apportez votre serviette ou votre tapis et laissez-vous bercer par le bruit des vagues basques.",
    "category": "Sports & Surf",
    "url": "https://lageneraleanglet.com",
    "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Tournoi de Pelote Basque",
    "date": "2026-06-25",
    "time": "17:00",
    "location": "Bayonne",
    "venue": "Trinquet Moderne de Bayonne",
    "description": "Venez assister à un grand tournoi de Pelote Basque à main nue opposant les meilleurs pilotaris de la région. Une occasion idéale pour découvrir la ferveur et les règles de ce sport traditionnel basque majeur.",
    "category": "Sports & Surf",
    "url": "https://www.bayonne.fr",
    "image": "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Récital d'Orgue d'été",
    "date": "2026-07-05",
    "time": "16:00",
    "location": "Bayonne",
    "venue": "Cathédrale Sainte-Marie de Bayonne",
    "description": "Concert d'orgue exceptionnel dans le cadre somptueux de la cathédrale gothique de Bayonne. Un voyage musical spirituel à travers des œuvres de Bach, Widor et Vierne interprétées par un organiste de renommée internationale.",
    "category": "Concerts & Music",
    "url": "https://www.bayonne.fr",
    "image": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Biarritz Piano Festival",
    "date": "2026-08-03",
    "time": "21:00",
    "location": "Biarritz",
    "venue": "Espace Bellevue Biarritz",
    "description": "Le rendez-vous des virtuoses du piano. Récitals classiques de piano solo et duos d'exception face à l'océan Atlantique. Une programmation artistique prestigieuse alliant grands maîtres de la musique et jeunes talents prometteurs.",
    "category": "Concerts & Music",
    "url": "https://www.biarritzpianofestival.com",
    "image": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=600&q=80"
  },
  {
    "title": "Exposition Art & Océan",
    "date": "2026-06-18",
    "time": "14:00",
    "location": "Anglet",
    "venue": "Galerie Georges Pompidou d'Anglet",
    "description": "Une exposition collective d'artistes contemporains locaux et internationaux explorant la thématique de la préservation de l'océan. Peintures, sculptures de plastique recyclé, et installations interactives multimédia.",
    "category": "Culture & Heritage",
    "url": "https://www.anglet.fr",
    "image": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=600&q=80"
  }
];
