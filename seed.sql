-- SnorkelGC D1 Seed Data

INSERT INTO spots (id, name, location, lat, lng, rating, reviews, description, image_url, badge, difficulty, entry_point, best_time, exposed_to, marine_life_description) VALUES
  ('las-canteras', 'Las Canteras', 'Las Palmas de Gran Canaria', 28.14376, -15.433521, 9.4, 128,
   'The volcanic reef ''La Barra'' acts as a natural breakwater, creating a safe lagoon teeming with biodiversity. Commonly sighted species include Parrotfish, ornate wrasses, and small rays in the sandy patches.',
   'assets/images/las-canteras.jpg', 'MOST POPULAR', 'beginner',
   'Main beach access via Paseo de Las Canteras', 'Morning (8-11am) for calmest waters',
   270, 'The volcanic reef ''La Barra'' acts as a natural breakwater, creating a safe lagoon teeming with biodiversity.'),

  ('el-cabron', 'El Cabrón', 'Arinaga, Agüimes', 27.870666, -15.386634, 8.9, 87,
   'Marine reserve with exceptional biodiversity. Rocky formations create natural pools perfect for snorkeling. Best spot for underwater photography in all of Gran Canaria.',
   'assets/images/el-cabron.jpeg', 'BEST VISIBILITY', 'intermediate',
   'Rocky beach access, use designated dive entry point', 'Early morning for best visibility',
   90, 'Protected marine reserve with incredible variety. Groupers, moray eels, and angel sharks are regularly spotted.'),

  ('puerto-mogan', 'Puerto de Mogán', 'Mogán', 27.818044, -15.762344, 9.1, 64,
   'Calm, crystal-clear waters in a protected bay. Perfect for families and beginners. The marina area offers easy access and plenty of facilities.',
   'assets/images/puerto-mogan.jpg', 'CALM WATERS', 'beginner',
   'Beach access via main promenade', 'Afternoon (2-5pm) when sun illuminates the bay',
   315, 'Sheltered bay with sandy bottom and rocky outcrops. Good for spotting small fish, sea bream, and occasionally turtles.'),

  ('confital', 'Playa del Confital', 'Las Palmas de Gran Canaria', 28.16011063084463, -15.435121249414243, 8.3, 41,
   'Wild rocky beach just north of Las Canteras. Exposed volcanic reef with rich marine life. Popular with local freedivers. The northern end offers the best underwater visibility.',
   'assets/images/playa-del-confital.png', NULL, 'intermediate',
   'Rocky entry at the northern tip of the beach', 'Low tide mornings',
   0, 'Exposed rocky reef with good diversity. Common to see parrotfish, octopus, and occasionally barracudas near the reef edge.'),

  ('sardina-norte', 'Sardina del Norte', 'Gáldar', 28.152858452818656, -15.696619798760123, 8.6, 33,
   'Quiet fishing village with a sheltered cove and excellent snorkeling conditions. Protected from the prevailing northeast winds. Pristine rocky seabed with rich ecosystems and few tourists.',
   'assets/images/playa-sardina.jpg', 'RECOMMENDED', 'beginner',
   'Sandy beach entry from main promenade', 'Late morning, when the water settles',
   45, 'Calm sheltered bay with sandy bottom and rocky sides. Colourful wrasses and sea bream are abundant.'),

  ('tufia', 'Playa de Tufia', 'Telde', 27.957974735351108, -15.381852967612407, 8.7, 29,
   'Hidden gem on the east coast. A protected cove surrounded by volcanic cliffs with pre-Hispanic ruins nearby. One of the clearest waters on the east coast — almost always deserted.',
   'assets/images/playa-tufia.jpg', NULL, 'intermediate',
   'Rocky steps on the south side of the cove', 'Morning before wind picks up',
   90, 'Protected cove with volcanic rock formations. Excellent for spotting moray eels, sea bream, and colourful wrasses.'),

  ('anfi-del-mar', 'Anfi del Mar', 'Mogán', 27.772846046401682, -15.695869943516328, 8.5, 52,
   'Artificial white-sand lagoon in a sheltered bay. Ultra-calm waters with great visibility. The rocky edges of the breakwater are home to rich marine life — easy sandy entry.',
   'assets/images/playa-anfi-mar.jpg', NULL, 'beginner',
   'Direct beach entry from white sand area', 'Anytime — sheltered from wind all day',
   225, 'Sheltered lagoon with sandy bottom and rich edges. Trumpetfish, parrotfish, and small reef fish are very common.'),

  ('puerto-rico', 'Puerto Rico', 'Mogán', 27.785613132672776, -15.71285464930681, 8.2, 76,
   'One of the sunniest bays in Gran Canaria. The breakwater rocks and marina walls have great fish life just below the surface. Perfect for beginners wanting calm water and easy entry.',
   'assets/images/playa-puerto-rico.jpg', NULL, 'beginner',
   'Beach entry or marina wall steps', 'Late afternoon with best light',
   270, 'Marina walls and breakwater rocks shelter many species. Damselfish, wrasses, and parrotfish are very common.'),

  ('guigui', 'Playa de Güigüi', 'San Nicolás de Tolentino', 27.948696387501787, -15.827943541112543, 9.6, 18,
   'Gran Canaria''s most remote and pristine beach. Accessible only by boat or a 2-hour hike. Black volcanic sand, crystal-clear waters, and an untouched marine ecosystem. Adventurous snorkelers only.',
   'assets/images/playa-guigui.jpg', 'BEST VISIBILITY', 'advanced',
   'Rocky entry at north end of the beach', 'Summer months only — check weather before going',
   270, 'Untouched marine reserve with exceptional biodiversity. Angel sharks rest on the sandy bottom, and large groupers patrol the reef.'),

  ('playa-chica', 'Playa Chica', 'Las Palmas de Gran Canaria', 28.14037965769678, -15.435942993415766, 8.8, 74,
   'Located at the southern end of Las Canteras, Playa Chica is one of the best spots for snorkeling with friends and family. With a maximum depth of 5 metres and low difficulty level, it offers an easy sandy entry and a sheltered environment perfect for beginners.',
   'assets/images/playa-chica.jpg', 'CALM WATERS', 'beginner',
   'Sandy entry at the southern end of Las Canteras promenade', 'Morning for calmest and clearest water',
   270, 'Sheltered sandy bottom with rocky patches. Ideal for spotting small reef fish, wrasses and parrotfish in calm, clear water.'),

  ('playa-nieves', 'Playa de las nieves', 'Agaete', 28.100491260712374, -15.709068406866088, 8.5, 38,
   'Located in the municipality of Agaete, Las Merinas stands out for its rocky bottom and enormous marine diversity. Easy immersion and very little current make it ideal for a relaxed snorkeling day. One of the most visually striking spots on the northwest coast.',
   'assets/images/playa-nieves.jpg', 'RECOMMENDED', 'beginner',
   'Rocky entry from the small cove near Puerto de las Nieves', 'Morning when the water is at its calmest',
   315, 'Rocky seabed with exceptional marine diversity. Moray eels, groupers and colourful wrasses thrive in the volcanic formations.'),

  ('las-salinas', 'Las Salinas', 'Arucas', 28.149562092984283, -15.535417047601637, 7.9, 21,
   'On the north coast of Gran Canaria, in the municipality of Arucas, Las Salinas offers a beautiful and rich seabed for snorkeling. However, the strong swell that characterises the north coast makes this spot advisable only for experienced snorkelers.',
   'assets/images/las-salinas.jpg', NULL, 'advanced',
   'Rocky coastal entry — check swell before entering', 'Summer only, on days with minimal north swell',
   0, 'North coast rocky seabed with varied marine life thriving in the strong currents. Large pelagic fish and sea bream are frequently spotted.'),

  ('el-burrero', 'Playa de El Burrero', 'Ingenio', 27.910702195323154, -15.387082230144685, 8.0, 22,
   'Dark volcanic sand beach on the quiet east coast. Rocky reef at both ends of the beach with reliable snorkeling. A local favourite rarely visited by tourists. Great year-round conditions.',
   'assets/images/playa-del-burrero.jpg', NULL, 'beginner',
   'Sandy beach entry, snorkel towards the rocks', 'Morning before the east wind picks up',
   90, 'Volcanic reef with a good range of east-coast species. Octopus, sea bream, and blennies are common under the rocks.');

-- Species
INSERT INTO species (spot_id, scientific_name, common_name, rarity) VALUES
  ('las-canteras', 'Sparisoma cretense', 'Parrotfish', 'common'),
  ('las-canteras', 'Coris julis', 'Ornate Wrasse', 'common'),
  ('las-canteras', 'Raja spp.', 'Rays', 'uncommon'),
  ('las-canteras', 'Octopus vulgaris', 'Octopus', 'uncommon'),

  ('el-cabron', 'Epinephelus marginatus', 'Grouper', 'uncommon'),
  ('el-cabron', 'Muraena helena', 'Moray Eel', 'common'),
  ('el-cabron', 'Squatina squatina', 'Angel Shark', 'rare'),

  ('puerto-mogan', 'Diplodus spp.', 'Sea Bream', 'common'),
  ('puerto-mogan', 'Chelonia mydas', 'Green Turtle', 'rare'),
  ('puerto-mogan', 'Thalassoma pavo', 'Rainbow Wrasse', 'common'),

  ('confital', 'Sparisoma cretense', 'Parrotfish', 'common'),
  ('confital', 'Octopus vulgaris', 'Octopus', 'common'),
  ('confital', 'Sphyraena sphyraena', 'Barracuda', 'uncommon'),

  ('sardina-norte', 'Coris julis', 'Ornate Wrasse', 'common'),
  ('sardina-norte', 'Diplodus spp.', 'Sea Bream', 'common'),
  ('sardina-norte', 'Dasyatis pastinaca', 'Common Stingray', 'uncommon'),

  ('tufia', 'Muraena helena', 'Moray Eel', 'common'),
  ('tufia', 'Coris julis', 'Ornate Wrasse', 'common'),
  ('tufia', 'Scorpaena scrofa', 'Scorpionfish', 'uncommon'),

  ('anfi-del-mar', 'Aulostomus strigosus', 'Trumpetfish', 'common'),
  ('anfi-del-mar', 'Sparisoma cretense', 'Parrotfish', 'common'),
  ('anfi-del-mar', 'Thalassoma pavo', 'Rainbow Wrasse', 'common'),

  ('puerto-rico', 'Chromis chromis', 'Damselfish', 'common'),
  ('puerto-rico', 'Coris julis', 'Ornate Wrasse', 'common'),
  ('puerto-rico', 'Diplodus sargus', 'White Seabream', 'common'),

  ('guigui', 'Squatina squatina', 'Angel Shark', 'uncommon'),
  ('guigui', 'Epinephelus marginatus', 'Grouper', 'common'),
  ('guigui', 'Dasyatis pastinaca', 'Stingray', 'common'),

  ('playa-chica', 'Sparisoma cretense', 'Parrotfish', 'common'),
  ('playa-chica', 'Coris julis', 'Ornate Wrasse', 'common'),
  ('playa-chica', 'Diplodus spp.', 'Sea Bream', 'common'),

  ('playa-nieves', 'Muraena helena', 'Moray Eel', 'common'),
  ('playa-nieves', 'Epinephelus marginatus', 'Grouper', 'uncommon'),
  ('playa-nieves', 'Coris julis', 'Ornate Wrasse', 'common'),
  ('playa-nieves', 'Octopus vulgaris', 'Octopus', 'uncommon'),

  ('las-salinas', 'Diplodus spp.', 'Sea Bream', 'common'),
  ('las-salinas', 'Seriola dumerili', 'Greater Amberjack', 'uncommon'),
  ('las-salinas', 'Scorpaena scrofa', 'Scorpionfish', 'common'),

  ('el-burrero', 'Octopus vulgaris', 'Octopus', 'common'),
  ('el-burrero', 'Diplodus spp.', 'Sea Bream', 'common'),
  ('el-burrero', 'Parablennius spp.', 'Blenny', 'common');

-- Facilities
INSERT INTO facilities (spot_id, type, name, available) VALUES
  ('las-canteras', 'parking', 'Public Parking', 1),
  ('las-canteras', 'showers', 'Beach Showers', 1),
  ('las-canteras', 'equipment-rental', 'Snorkel Rental', 1),
  ('las-canteras', 'lifeguard', 'Lifeguard Service', 1),

  ('el-cabron', 'parking', 'Reserve Parking', 1),
  ('el-cabron', 'showers', 'Basic Showers', 1),

  ('puerto-mogan', 'parking', 'Public Parking', 1),
  ('puerto-mogan', 'showers', 'Beach Showers', 1),
  ('puerto-mogan', 'equipment-rental', 'Water Sports Center', 1),
  ('puerto-mogan', 'restaurant', 'Multiple Restaurants', 1),
  ('puerto-mogan', 'lifeguard', 'Lifeguard Service', 1),

  ('confital', 'parking', 'Street Parking', 1),

  ('sardina-norte', 'parking', 'Public Parking', 1),
  ('sardina-norte', 'showers', 'Beach Showers', 1),
  ('sardina-norte', 'restaurant', 'Chiringuito', 1),

  ('tufia', 'parking', 'Dirt Road Parking', 1),

  ('anfi-del-mar', 'parking', 'Resort Parking', 1),
  ('anfi-del-mar', 'showers', 'Beach Showers', 1),
  ('anfi-del-mar', 'equipment-rental', 'Snorkel & Kayak Rental', 1),
  ('anfi-del-mar', 'restaurant', 'Beach Restaurant', 1),
  ('anfi-del-mar', 'lifeguard', 'Lifeguard Service', 1),

  ('puerto-rico', 'parking', 'Public Parking', 1),
  ('puerto-rico', 'showers', 'Beach Showers', 1),
  ('puerto-rico', 'equipment-rental', 'Dive & Snorkel Shop', 1),
  ('puerto-rico', 'restaurant', 'Multiple Restaurants', 1),
  ('puerto-rico', 'lifeguard', 'Lifeguard Service', 1),

  ('guigui', 'parking', 'No facilities — carry everything in', 0),

  ('playa-chica', 'parking', 'Public Parking', 1),
  ('playa-chica', 'showers', 'Beach Showers', 1),
  ('playa-chica', 'lifeguard', 'Lifeguard Service', 1),

  ('playa-nieves', 'parking', 'Public Parking', 1),
  ('playa-nieves', 'showers', 'Basic Showers', 1),

  ('las-salinas', 'parking', 'Street Parking', 1),

  ('el-burrero', 'parking', 'Street Parking', 1),
  ('el-burrero', 'showers', 'Basic Showers', 1);
