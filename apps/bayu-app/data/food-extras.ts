import { FoodReview, FoodCoordinate } from '@/types';

// 24-entry crowding score (0–100) per food spot — index = hour of day
const peak = (hours: Record<number, number>): number[] => {
  const arr = Array(24).fill(5);
  Object.entries(hours).forEach(([h, v]) => { arr[+h] = v; });
  // smooth decay to neighbours
  return arr.map((v, i) => {
    const l = arr[i - 1] ?? 0;
    const r = arr[i + 1] ?? 0;
    return Math.max(v, l * 0.6, r * 0.6, 5);
  });
};

export const foodPeakHours: Record<string, number[]> = {
  f1: peak({ 12: 85, 13: 92, 14: 70, 18: 78, 19: 95, 20: 88, 21: 60 }),
  f2: peak({ 7: 95, 8: 88, 9: 75, 10: 55 }),
  f3: peak({ 7: 70, 8: 90, 9: 95, 10: 85, 11: 65 }),
  f4: peak({ 17: 55, 18: 80, 19: 95, 20: 90, 21: 75, 22: 50 }),
  f5: peak({ 11: 70, 12: 88, 13: 95, 14: 65, 17: 70, 18: 85, 19: 92, 20: 75 }),
  f6: peak({ 10: 60, 11: 75, 12: 88, 13: 82, 14: 70, 15: 60 }),
  f7: peak({ 7: 88, 8: 95, 9: 70, 12: 85, 13: 92, 14: 70 }),
  f8: peak({ 7: 80, 8: 92, 9: 95, 10: 75 }),
  f9: peak({ 17: 60, 18: 85, 19: 95, 20: 92, 21: 80, 22: 55 }),
  f10: peak({ 12: 70, 13: 85, 14: 65, 18: 75, 19: 92, 20: 88, 21: 70 }),
};

// Food gallery images — 3 per spot
export const foodGalleries: Record<string, string[]> = {
  f1: [
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=800',
    'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800',
  ],
  f2: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800',
  ],
  f3: [
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800',
    'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800',
    'https://images.unsplash.com/photo-1516824711718-d38aeb4d5f3a?w=800',
  ],
  f4: [
    'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
    'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
  ],
  f5: [
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800',
    'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=800',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
  ],
  f6: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    'https://images.unsplash.com/photo-1528750717929-32abb73d3bd9?w=800',
  ],
  f7: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
  ],
  f8: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800',
  ],
  f9: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800',
    'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800',
  ],
  f10: [
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800',
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
  ],
};

// 3–4 reviews per spot
export const foodReviews: Record<string, FoodReview[]> = {
  f1: [
    { id: 'r1', name: 'Sarah L.', rating: 5, text: 'Butter prawns were insane. Came back twice in three days.', date: '2 days ago', avatarHue: 210 },
    { id: 'r2', name: 'Zul H.', rating: 5, text: 'Best hinava I\'ve ever had. Staff explained every ingredient.', date: '1 week ago', avatarHue: 35 },
    { id: 'r3', name: 'Kenji T.', rating: 4, text: 'Bambangan ice cream is a must. Prices reasonable for the view.', date: '2 weeks ago', avatarHue: 145 },
  ],
  f2: [
    { id: 'r1', name: 'Aisha R.', rating: 5, text: 'Tuaran mee + kopi-O = Sabah morning done right.', date: '3 days ago', avatarHue: 320 },
    { id: 'r2', name: 'Marcus T.', rating: 4, text: 'Old-school kopitiam, busy mornings. Worth the queue.', date: '1 week ago', avatarHue: 180 },
    { id: 'r3', name: 'Li Wei', rating: 5, text: 'Roti kahwin with kaya — simple perfection.', date: '2 weeks ago', avatarHue: 60 },
  ],
  f3: [
    { id: 'r1', name: 'Emma F.', rating: 5, text: 'Get there early! So much variety, every vendor has something.', date: '1 day ago', avatarHue: 280 },
    { id: 'r2', name: 'Daniel K.', rating: 4, text: 'Pisang goreng at corner stall is legendary.', date: '5 days ago', avatarHue: 15 },
    { id: 'r3', name: 'Priya M.', rating: 5, text: 'Tropical fruits so fresh. Try the mangosteens.', date: '2 weeks ago', avatarHue: 200 },
  ],
  f4: [
    { id: 'r1', name: 'Hassan O.', rating: 5, text: 'Ikan bakar was fall-off-the-bone tender. Amazing.', date: '4 days ago', avatarHue: 100 },
    { id: 'r2', name: 'Lina C.', rating: 4, text: 'Sunset + BBQ = perfect evening. Jagung bakar was next level.', date: '1 week ago', avatarHue: 340 },
    { id: 'r3', name: 'Raj P.', rating: 4, text: 'Local crowd, authentic flavour. Bring cash.', date: '2 weeks ago', avatarHue: 250 },
  ],
  f5: [
    { id: 'r1', name: 'Mei L.', rating: 5, text: 'Steamed grouper was the freshest I\'ve ever had.', date: '2 days ago', avatarHue: 160 },
    { id: 'r2', name: 'Tom W.', rating: 5, text: 'Mantis shrimp is a must-order. Unreal sweetness.', date: '6 days ago', avatarHue: 220 },
    { id: 'r3', name: 'Yuki N.', rating: 4, text: 'Sea urchin season is peak. Worth the trip to Semporna.', date: '2 weeks ago', avatarHue: 40 },
  ],
  f6: [
    { id: 'r1', name: 'Chen Y.', rating: 4, text: 'Swiss-like cow fields with Kinabalu backdrop. Surreal.', date: '3 days ago', avatarHue: 120 },
    { id: 'r2', name: 'Farah Z.', rating: 5, text: 'Yogurt is better than most cafés in KL. Get the cheese platter.', date: '1 week ago', avatarHue: 290 },
    { id: 'r3', name: 'Alex G.', rating: 4, text: 'Cool air, fresh milk, killer views. Kids loved it.', date: '2 weeks ago', avatarHue: 80 },
  ],
  f7: [
    { id: 'r1', name: 'Ravi S.', rating: 5, text: 'Roti canai crispy and fluffy. Teh tarik perfection.', date: '1 day ago', avatarHue: 30 },
    { id: 'r2', name: 'Amanda P.', rating: 4, text: 'Nasi kandar is my go-to lunch here. Consistent quality.', date: '4 days ago', avatarHue: 180 },
    { id: 'r3', name: 'Ibrahim K.', rating: 4, text: 'Old staff, warm service. Good value.', date: '2 weeks ago', avatarHue: 230 },
  ],
  f8: [
    { id: 'r1', name: 'Daniel W.', rating: 5, text: 'Beaufort mee goreng — wok hei perfection.', date: '2 days ago', avatarHue: 260 },
    { id: 'r2', name: 'Aina S.', rating: 4, text: 'Worth the detour from KK. Small shop, big flavour.', date: '1 week ago', avatarHue: 55 },
    { id: 'r3', name: 'Jia M.', rating: 5, text: 'Mee kuah has the most incredible pork-free broth.', date: '2 weeks ago', avatarHue: 170 },
  ],
  f9: [
    { id: 'r1', name: 'Kevin L.', rating: 5, text: 'Stingray BBQ with sambal — absolutely wild.', date: '1 day ago', avatarHue: 10 },
    { id: 'r2', name: 'Fara I.', rating: 4, text: 'Night market vibes, affordable. Bring wet wipes!', date: '5 days ago', avatarHue: 310 },
    { id: 'r3', name: 'Josh T.', rating: 4, text: 'Coconut shake is a must. Prices double if you don\'t haggle.', date: '2 weeks ago', avatarHue: 200 },
  ],
  f10: [
    { id: 'r1', name: 'Neha R.', rating: 5, text: 'Butter chicken + garlic naan. Best in Sabah hands down.', date: '2 days ago', avatarHue: 300 },
    { id: 'r2', name: 'Tariq A.', rating: 4, text: 'Biryani has real depth. Great for larger groups.', date: '1 week ago', avatarHue: 20 },
    { id: 'r3', name: 'Olivia C.', rating: 5, text: 'Harbour-side dining with top-tier service.', date: '2 weeks ago', avatarHue: 140 },
  ],
};

// SVG coordinates on a 320x400 canvas — for the Food Map
export const foodCoordinates: Record<string, FoodCoordinate> = {
  f1: { x: 110, y: 240, region: 'KK' },
  f2: { x: 125, y: 230, region: 'KK' },
  f3: { x: 130, y: 225, region: 'KK' },
  f4: { x: 100, y: 255, region: 'KK' },
  f5: { x: 245, y: 195, region: 'Semporna' },
  f6: { x: 175, y: 170, region: 'Kundasang' },
  f7: { x: 118, y: 232, region: 'KK' },
  f8: { x: 95, y: 305, region: 'Beaufort' },
  f9: { x: 138, y: 238, region: 'KK' },
  f10: { x: 105, y: 248, region: 'KK' },
};
