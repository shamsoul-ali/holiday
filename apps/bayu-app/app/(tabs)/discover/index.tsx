import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useDiscoverStore, useGamificationStore } from '@/store';
import { Badge, Card, StarRating, EventCard } from '@/components/ui';
import { sabahEvents, sabahNews, sabahHotelStats } from '@/data';
import { getRelativeTime } from '@/utils';
import { SabahMap, MapMode } from '@/components/SabahMap';
import { SabahMapSheet } from '@/components/SabahMapSheet';

const tabs = ['Map', 'Food Map', 'Marketplace', 'Safety', 'Muslim', 'Events', 'News', 'Badges'] as const;
type TabType = typeof tabs[number];

const mapModes: { id: MapMode; label: string; icon: string; color: string }[] = [
  { id: 'occupancy', label: 'Hotels', icon: 'bed', color: '#F7B731' },
  { id: 'food',      label: 'Food',   icon: 'restaurant', color: '#F7B731' },
  { id: 'islands',   label: 'Islands',icon: 'boat', color: '#2EAFE8' },
  { id: 'activity',  label: 'Events', icon: 'calendar', color: '#059669' },
  { id: 'crowd',     label: 'Crowd',  icon: 'people', color: '#2EAFE8' },
  { id: 'safety',    label: 'Safety', icon: 'shield-checkmark', color: '#F5362F' },
];

const foodTags = ['all', 'tourist-friendly', 'muslim-friendly', 'viral-spot', 'local-gem'] as const;
const agentTypes = ['all', 'dive-center', 'guide', 'tour-operator', 'transport', 'homestay', 'cultural-guide'] as const;
const agentTypeLabels: Record<string, string> = {
  'all': 'All',
  'dive-center': 'Diving',
  'guide': 'Guides',
  'tour-operator': 'Tours',
  'transport': 'Transport',
  'homestay': 'Homestay',
  'cultural-guide': 'Culture',
};

const severityColors: Record<string, string> = {
  info: Colors.info,
  warning: Colors.warning,
  danger: Colors.error,
};

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('Map');
  const [mapMode, setMapMode] = useState<MapMode>('occupancy');
  const [selectedMapDistrict, setSelectedMapDistrict] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const {
    prayerTimes, restaurants, hijriDate, selectedCity, qiblaDirection,
    foodSpots, selectedFoodTag, setFoodTag,
    agents, selectedAgentType, setAgentType,
    alerts, emergencyContacts,
  } = useDiscoverStore();
  const { badges, stats } = useGamificationStore();

  const filteredFoodSpots = selectedFoodTag === 'all'
    ? foodSpots
    : foodSpots.filter((f) => f.tags.includes(selectedFoodTag));

  const filteredAgents = selectedAgentType === 'all'
    ? agents
    : agents.filter((a) => a.type === selectedAgentType);

  const HubCTA = ({ title, description, icon, gradient, onPress }: {
    title: string;
    description: string;
    icon: string;
    gradient: readonly [string, string] | readonly [string, string, string];
    onPress: () => void;
  }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ marginBottom: Spacing.md }}>
      <LinearGradient colors={gradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hubCta}>
        <View style={styles.hubCtaIcon}>
          <Ionicons name={icon as any} size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hubCtaTitle}>{title}</Text>
          <Text style={styles.hubCtaDesc}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSabahMap = () => {
    const currentMode = mapModes.find((m) => m.id === mapMode)!;
    const legendByMode: Record<MapMode, { label: string; stops: { color: string; label: string }[] }> = {
      occupancy: {
        label: `Hotel occupancy · ${sabahHotelStats.avgOccupancy}% avg · ${sabahHotelStats.totalRooms.toLocaleString()} rooms`,
        stops: [
          { color: '#12253F', label: '<50%' },
          { color: '#2EAFE8', label: '50-80%' },
          { color: '#F7B731', label: '80-90%' },
          { color: '#F5362F', label: '>90%' },
        ],
      },
      crowd: {
        label: 'Tourist crowd level (current)',
        stops: [
          { color: '#1F4466', label: 'Quiet' },
          { color: '#2EAFE8', label: 'Steady' },
          { color: '#F7B731', label: 'Busy' },
          { color: '#F5362F', label: 'Peak' },
        ],
      },
      food: { label: 'Food spots per district', stops: [{ color: '#12253F', label: 'None' }, { color: '#2EAFE8', label: '1' }, { color: '#F7B731', label: '2-3' }, { color: '#F5362F', label: '4+' }] },
      islands: { label: 'Islands per district', stops: [{ color: '#12253F', label: 'None' }, { color: '#2EAFE8', label: '1-3' }, { color: '#F7B731', label: '4-6' }, { color: '#F5362F', label: '7+' }] },
      activity: { label: 'Events + festivals per district', stops: [{ color: '#12253F', label: 'None' }, { color: '#2EAFE8', label: '1' }, { color: '#F7B731', label: '2' }, { color: '#F5362F', label: '3+' }] },
      safety: { label: 'Active safety alerts', stops: [{ color: '#12253F', label: 'None' }, { color: '#F7B731', label: '1' }, { color: '#F5362F', label: '2+' }] },
      plain: { label: 'Sabah districts', stops: [] },
    };
    const legend = legendByMode[mapMode];

    return (
      <Animated.View entering={FadeInDown.duration(400)}>
        {/* Mode chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.xs, paddingRight: Spacing.base, paddingVertical: Spacing.xs }}
          style={styles.chipScroll}
        >
          {mapModes.map((m) => {
            const active = mapMode === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.mapModeChip, active && { backgroundColor: m.color, borderColor: m.color }]}
                onPress={() => setMapMode(m.id)}
                activeOpacity={0.85}
              >
                <Ionicons name={m.icon as any} size={12} color={active ? '#FFFFFF' : m.color} />
                <Text style={[styles.mapModeChipText, active && { color: '#FFFFFF' }]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Map */}
        <View style={styles.mapFrame}>
          <SabahMap
            mode={mapMode}
            selectedDistrictId={selectedMapDistrict}
            onSelectDistrict={(id) => {
              setSelectedMapDistrict(id);
              setSheetVisible(true);
            }}
            height={420}
          />
          <View style={styles.mapModeBadge}>
            <Ionicons name={currentMode.icon as any} size={12} color="#FFFFFF" />
            <Text style={styles.mapModeBadgeText}>{currentMode.label} view</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>{legend.label}</Text>
          {legend.stops.length > 0 && (
            <View style={styles.legendStops}>
              {legend.stops.map((stop) => (
                <View key={stop.label} style={styles.legendStop}>
                  <View style={[styles.legendSwatch, { backgroundColor: stop.color }]} />
                  <Text style={styles.legendStopText}>{stop.label}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.legendFootnote}>Tap any district for details · 5 airports · 40+ offshore islands</Text>
        </View>

        <SabahMapSheet
          visible={sheetVisible}
          districtId={selectedMapDistrict}
          mode={mapMode}
          onClose={() => setSheetVisible(false)}
        />
      </Animated.View>
    );
  };

  const renderFoodMap = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <HubCTA
        title="Open Food Intelligence Hub"
        description="Map view, peak hours, reviews & halal filters"
        icon="restaurant"
        gradient={Colors.gradients.sunsetGlow}
        onPress={() => router.push('/(tabs)/home/food' as any)}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ gap: Spacing.xs, paddingRight: Spacing.base, paddingVertical: Spacing.xs }}>
        {foodTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.chip, selectedFoodTag === tag && styles.chipActive]}
            onPress={() => setFoodTag(tag)}
          >
            <Text style={[styles.chipText, selectedFoodTag === tag && styles.chipTextActive]}>
              {tag === 'all' ? 'All' : tag.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredFoodSpots.map((spot) => (
        <TouchableOpacity
          key={spot.id}
          activeOpacity={0.9}
          onPress={() => router.push({ pathname: '/(tabs)/home/food/[id]', params: { id: spot.id } } as any)}
        >
          <Card style={styles.foodCard}>
            <View style={styles.foodRow}>
              <Image source={{ uri: spot.image }} style={styles.foodImage} contentFit="cover" />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{spot.name}</Text>
                <Text style={styles.foodCuisine}>{spot.cuisine} {spot.priceRange}</Text>
                <View style={styles.foodMeta}>
                  <StarRating rating={spot.rating} size={12} />
                  <Text style={styles.foodRating}>{spot.rating}</Text>
                  {spot.isHalal && <Badge label="Halal" color="#059669" size="sm" />}
                </View>
                <Text style={styles.foodPeak}>Peak: {spot.peakHours}</Text>
                <View style={styles.foodTags}>
                  {spot.mustTry.slice(0, 2).map((item, i) => (
                    <Badge key={i} label={item} color={Colors.primary + '15'} textColor={Colors.primary} size="sm" />
                  ))}
                </View>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const renderMarketplace = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ gap: Spacing.xs, paddingRight: Spacing.base, paddingVertical: Spacing.xs }}>
        {agentTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, selectedAgentType === type && styles.chipActive]}
            onPress={() => setAgentType(type)}
          >
            <Text style={[styles.chipText, selectedAgentType === type && styles.chipTextActive]}>
              {agentTypeLabels[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredAgents.map((agent) => (
        <Card key={agent.id} style={styles.agentCard}>
          <View style={styles.agentRow}>
            <Image source={{ uri: agent.image }} style={styles.agentImage} contentFit="cover" />
            <View style={styles.agentInfo}>
              <View style={styles.agentNameRow}>
                <Text style={styles.agentName}>{agent.name}</Text>
                {agent.verified && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
              </View>
              <Text style={styles.agentType}>{agent.type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} {agent.priceRange}</Text>
              <View style={styles.agentMeta}>
                <StarRating rating={agent.rating} size={12} />
                <Text style={styles.agentRating}>{agent.rating}</Text>
                <Text style={styles.agentLocation}>{agent.location}</Text>
              </View>
              <View style={styles.agentSpecialties}>
                {agent.specialties.slice(0, 2).map((s, i) => (
                  <Badge key={i} label={s} color={Colors.primary + '15'} textColor={Colors.primary} size="sm" />
                ))}
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL(`tel:${agent.contact}`)}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.contactBtnText}>Contact</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </Animated.View>
  );

  const renderSafety = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <HubCTA
        title="Open Safety Hub"
        description="SOS, tide, weather, hospitals & embassies"
        icon="shield-checkmark"
        gradient={Colors.gradients.oceanDepth}
        onPress={() => router.push('/(tabs)/home/safety-hub' as any)}
      />
      <Text style={styles.subSectionTitle}>Active Alerts</Text>
      {alerts.filter((a) => a.active).map((alert) => (
        <Card key={alert.id} style={{ ...styles.alertCard, borderLeftWidth: 4, borderLeftColor: severityColors[alert.severity] }}>
          <View style={styles.alertHeader}>
            <Ionicons
              name={alert.type === 'tide' ? 'water' : alert.type === 'weather' ? 'cloud' : alert.type === 'trail' ? 'trail-sign' : 'paw'}
              size={20}
              color={severityColors[alert.severity]}
            />
            <Text style={[styles.alertTitle, { color: severityColors[alert.severity] }]}>{alert.title}</Text>
          </View>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <Text style={styles.alertLocation}>{alert.location}</Text>
        </Card>
      ))}

      <Text style={[styles.subSectionTitle, { marginTop: Spacing.xl }]}>Emergency Contacts</Text>
      <Card style={{ padding: 0 }}>
        {emergencyContacts.map((contact, i) => (
          <TouchableOpacity
            key={contact.id}
            style={[styles.contactRow, i < emergencyContacts.length - 1 && styles.contactBorder]}
            onPress={() => Linking.openURL(`tel:${contact.number}`)}
          >
            <View style={styles.contactLeft}>
              <Ionicons
                name={contact.type === 'police' ? 'shield' : contact.type === 'ambulance' ? 'medkit' : contact.type === 'hospital' ? 'medical' : contact.type === 'coast-guard' ? 'boat' : contact.type === 'fire' ? 'flame' : 'call'}
                size={20}
                color={Colors.primary}
              />
              <View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
            </View>
            <Ionicons name="call" size={20} color={Colors.primary} />
          </TouchableOpacity>
        ))}
      </Card>
    </Animated.View>
  );

  const renderMuslim = () => {
    const nextPrayer = prayerTimes[3];
    return (
      <Animated.View entering={FadeInDown.duration(400)}>
        <LinearGradient colors={[...Colors.gradients.spiritual]} style={styles.nextPrayerCard}>
          <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
          <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
          <Text style={styles.hijriDate}>{hijriDate}</Text>
          <Text style={styles.locationText}>{selectedCity}</Text>
        </LinearGradient>

        <Card style={styles.prayerCard}>
          {prayerTimes.map((prayer, i) => (
            <View key={prayer.name} style={[styles.prayerRow, i < prayerTimes.length - 1 && styles.prayerBorder]}>
              <View style={styles.prayerLeft}>
                <Ionicons name={prayer.icon as any} size={20} color={prayer.name === nextPrayer.name ? Colors.category.cultural : Colors.textTertiary} />
                <Text style={[styles.prayerName, prayer.name === nextPrayer.name && styles.prayerNameActive]}>{prayer.name}</Text>
              </View>
              <Text style={[styles.prayerTime, prayer.name === nextPrayer.name && styles.prayerTimeActive]}>{prayer.time}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.qiblaCard}>
          <View style={styles.qiblaContent}>
            <View style={styles.qiblaCompass}>
              <Ionicons name="compass" size={48} color={Colors.category.cultural} />
            </View>
            <View>
              <Text style={styles.qiblaTitle}>Qibla Direction</Text>
              <Text style={styles.qiblaValue}>{qiblaDirection}° NW from {selectedCity}</Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.subSectionTitle, { marginTop: Spacing.md }]}>Halal Restaurants</Text>
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} style={styles.restaurantCard}>
            <View style={styles.restaurantRow}>
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} contentFit="cover" />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                <View style={styles.restaurantMeta}>
                  <StarRating rating={restaurant.rating} size={12} />
                  <Text style={styles.restaurantRating}>{restaurant.rating}</Text>
                  <Text style={styles.metaDot}>-</Text>
                  <Text style={styles.restaurantDistance}>{restaurant.distance}</Text>
                </View>
                <Badge label={restaurant.certification} color={Colors.category.cultural} size="sm" style={{ marginTop: Spacing.xs }} />
              </View>
            </View>
          </Card>
        ))}
      </Animated.View>
    );
  };

  const [eventMonthFilter, setEventMonthFilter] = useState<number | null>(null);
  const filteredEvents = eventMonthFilter
    ? sabahEvents.filter((e) => e.month === eventMonthFilter)
    : sabahEvents;

  const eventMonths = [...new Set(sabahEvents.map((e) => e.month))].sort((a, b) => a - b);
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const renderEvents = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ gap: Spacing.xs, paddingRight: Spacing.base, paddingVertical: Spacing.xs }}>
        <TouchableOpacity
          style={[styles.chip, eventMonthFilter === null && styles.chipActive]}
          onPress={() => setEventMonthFilter(null)}
        >
          <Text style={[styles.chipText, eventMonthFilter === null && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {eventMonths.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, eventMonthFilter === m && styles.chipActive]}
            onPress={() => setEventMonthFilter(m)}
          >
            <Text style={[styles.chipText, eventMonthFilter === m && styles.chipTextActive]}>{monthNames[m]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </Animated.View>
  );

  const renderNews = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      {sabahNews
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((item) => (
          <Card key={item.id} style={styles.newsCard}>
            <View style={styles.newsRow}>
              <Image source={{ uri: item.image }} style={styles.newsImage} contentFit="cover" />
              <View style={styles.newsInfo}>
                <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.newsSummary} numberOfLines={3}>{item.summary}</Text>
                <View style={styles.newsMeta}>
                  <Badge label={item.category} color={Colors.primary + '15'} textColor={Colors.primary} size="sm" />
                  <Text style={styles.newsSource}>{item.source}</Text>
                  <Text style={styles.newsDate}>{getRelativeTime(item.date)}</Text>
                </View>
              </View>
            </View>
          </Card>
        ))}
    </Animated.View>
  );

  const renderBadges = () => {
    const earnedBadges = badges.filter((b) => b.earned);
    const unearnedBadges = badges.filter((b) => !b.earned);
    return (
      <Animated.View entering={FadeInDown.duration(400)}>
        <HubCTA
          title="Open Travel Pass"
          description="Quests, leaderboard, redeem rewards & more"
          icon="ribbon"
          gradient={Colors.gradients.memberCard}
          onPress={() => router.push('/(tabs)/profile/travel-pass' as any)}
        />
        <LinearGradient colors={[...Colors.gradients.sabahSky]} style={styles.passCard}>
          <Text style={styles.passTitle}>Sabah Travel Pass</Text>
          <Text style={styles.passLevel}>Level {stats.level}</Text>
          <View style={styles.passProgressBg}>
            <View style={[styles.passProgressFill, { width: `${(stats.points / stats.nextLevelPoints) * 100}%` }]} />
          </View>
          <Text style={styles.passPoints}>{stats.points.toLocaleString()} / {stats.nextLevelPoints.toLocaleString()} pts</Text>
          <View style={styles.passStats}>
            <View style={styles.passStat}>
              <Text style={styles.passStatValue}>{stats.districtsVisited}</Text>
              <Text style={styles.passStatLabel}>Districts</Text>
            </View>
            <View style={styles.passStat}>
              <Text style={styles.passStatValue}>{stats.badgesEarned}</Text>
              <Text style={styles.passStatLabel}>Badges</Text>
            </View>
            <View style={styles.passStat}>
              <Text style={styles.passStatValue}>{stats.tripsCompleted}</Text>
              <Text style={styles.passStatLabel}>Trips</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.subSectionTitle}>Earned ({earnedBadges.length})</Text>
        <View style={styles.badgeGrid}>
          {earnedBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <View style={[styles.badgeIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name={badge.icon as any} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
              <Text style={styles.badgeDistrict} numberOfLines={1}>{badge.district}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.subSectionTitle, { marginTop: Spacing.lg }]}>Locked ({unearnedBadges.length})</Text>
        <View style={styles.badgeGrid}>
          {unearnedBadges.map((badge) => (
            <View key={badge.id} style={[styles.badgeItem, { opacity: 0.5 }]}>
              <View style={[styles.badgeIcon, { backgroundColor: Colors.surfaceSecondary }]}>
                <Ionicons name="lock-closed" size={24} color={Colors.textTertiary} />
              </View>
              <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
              <Text style={styles.badgeReq} numberOfLines={2}>{badge.requirement}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.subSectionTitle, { marginTop: Spacing.lg }]}>Districts Visited</Text>
        <Card>
          {stats.allDistricts.map((district, i) => {
            const visited = stats.visitedDistricts.includes(district);
            return (
              <View key={district} style={[styles.districtRow, i < stats.allDistricts.length - 1 && styles.prayerBorder]}>
                <View style={styles.districtLeft}>
                  <Ionicons name={visited ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={visited ? Colors.primary : Colors.textTertiary} />
                  <Text style={[styles.districtName, visited && { color: Colors.text, fontFamily: Typography.fonts.bodySemiBold }]}>{district}</Text>
                </View>
                {visited && <Badge label="Visited" color={Colors.primary} size="sm" />}
              </View>
            );
          })}
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Sabah</Text>
        <Text style={styles.headerSubtitle}>Food, guides, safety & more</Text>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'Map' && renderSabahMap()}
        {activeTab === 'Food Map' && renderFoodMap()}
        {activeTab === 'Marketplace' && renderMarketplace()}
        {activeTab === 'Safety' && renderSafety()}
        {activeTab === 'Muslim' && renderMuslim()}
        {activeTab === 'Events' && renderEvents()}
        {activeTab === 'News' && renderNews()}
        {activeTab === 'Badges' && renderBadges()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  headerTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  headerSubtitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  tabScroll: { marginBottom: Spacing.sm },
  tabContainer: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, gap: Spacing.xs },
  tab: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surface },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  tabTextActive: { color: '#FFFFFF' },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 100 },
  subSectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.sm },

  hubCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  hubCtaIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubCtaTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: '#FFFFFF',
  },
  hubCtaDesc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  chipScroll: { flexGrow: 0, marginBottom: Spacing.md, overflow: 'visible' },
  mapModeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  mapModeChipText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  mapFrame: { borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, position: 'relative' },
  mapModeBadge: { position: 'absolute', top: Spacing.md, left: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.sm, paddingVertical: 5, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  mapModeBadgeText: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF', letterSpacing: 0.5 },
  legendCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.base, marginBottom: Spacing.md },
  legendTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.sm },
  legendStops: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  legendStop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
  legendStopText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  legendFootnote: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, fontStyle: 'italic' },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  foodCard: { marginBottom: Spacing.md },
  foodRow: { flexDirection: 'row', gap: Spacing.md },
  foodImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
  foodInfo: { flex: 1 },
  foodName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  foodCuisine: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  foodMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  foodRating: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, marginRight: 4 },
  foodPeak: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 2 },
  foodTags: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs },

  agentCard: { marginBottom: Spacing.md },
  agentRow: { flexDirection: 'row', gap: Spacing.md },
  agentImage: { width: 70, height: 70, borderRadius: BorderRadius.md },
  agentInfo: { flex: 1 },
  agentNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  agentName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  agentType: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  agentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  agentRating: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  agentLocation: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginLeft: 4 },
  agentSpecialties: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs, flexWrap: 'wrap' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, marginTop: Spacing.md },
  contactBtnText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: '#FFFFFF' },

  alertCard: { marginBottom: Spacing.md },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  alertTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold },
  alertMessage: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, lineHeight: 20 },
  alertLocation: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary, marginTop: Spacing.xs },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base },
  contactBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  contactLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  contactName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  contactNumber: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },

  nextPrayerCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md },
  nextPrayerLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  nextPrayerName: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: Spacing.xs },
  nextPrayerTime: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  hijriDate: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.7)', marginTop: Spacing.sm },
  locationText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  prayerCard: { marginBottom: Spacing.md },
  prayerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  prayerBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  prayerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  prayerName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  prayerNameActive: { color: Colors.category.cultural, fontFamily: Typography.fonts.bodySemiBold },
  prayerTime: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  prayerTimeActive: { color: Colors.category.cultural },
  qiblaCard: { marginBottom: Spacing.md },
  qiblaContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  qiblaCompass: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.category.cultural + '15', alignItems: 'center', justifyContent: 'center' },
  qiblaTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text },
  qiblaValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  restaurantCard: { marginBottom: Spacing.md },
  restaurantRow: { flexDirection: 'row', gap: Spacing.md },
  restaurantImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
  restaurantInfo: { flex: 1 },
  restaurantName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  restaurantCuisine: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  restaurantRating: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  metaDot: { fontSize: Typography.sizes.xs, color: Colors.textTertiary },
  restaurantDistance: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary },

  passCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  passTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  passLevel: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: Spacing.xs },
  passProgressBg: { width: '80%', height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: Spacing.md },
  passProgressFill: { height: '100%', borderRadius: 4, backgroundColor: '#FFFFFF' },
  passPoints: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)', marginTop: Spacing.xs },
  passStats: { flexDirection: 'row', gap: Spacing['2xl'], marginTop: Spacing.lg },
  passStat: { alignItems: 'center' },
  passStatValue: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  passStatLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  badgeItem: { width: '28%', alignItems: 'center', marginBottom: Spacing.sm },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  badgeName: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, textAlign: 'center' },
  badgeDistrict: { fontSize: 10, fontFamily: Typography.fonts.body, color: Colors.textTertiary, textAlign: 'center' },
  badgeReq: { fontSize: 10, fontFamily: Typography.fonts.body, color: Colors.textTertiary, textAlign: 'center' },
  districtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  districtLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  districtName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  newsCard: { marginBottom: Spacing.md },
  newsRow: { flexDirection: 'row', gap: Spacing.md },
  newsImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
  newsInfo: { flex: 1 },
  newsTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  newsSummary: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, lineHeight: 18, marginTop: 2 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  newsSource: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  newsDate: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
});
