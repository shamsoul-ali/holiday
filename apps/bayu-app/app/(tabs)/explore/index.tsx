import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeInRight } from 'react-native-reanimated';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useTripStore, DEPARTURE_CITIES } from '@/store/tripStore';
import { Button, Chip, ProgressBar, Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { sabahDestinations, destinationToDistrict } from '@/data';
import { SabahMap } from '@/components/SabahMap';
import { formatCurrency, formatDurationLabel } from '@/utils';
import { TierType, DurationPreset } from '@/types';
import { hapticSelection } from '@/utils';

const interests = ['Island Hopping', 'Diving & Snorkeling', 'Mountain Climbing', 'Wildlife Safari', 'Cultural Heritage', 'Food Tour', 'Eco-Tourism', 'Adventure Sports', 'Photography', 'Relaxation', 'River Cruise', 'Beach & Sunset'];

const TOTAL_STEPS = 5;

const durationPresets: DurationPreset[] = ['2D1N', '3D2N', '4D3N', '5D4N', '7D6N'];

const travelMonths = [
  { label: 'Apr 2026', value: '2026-04-15' },
  { label: 'May 2026', value: '2026-05-15' },
  { label: 'Jun 2026', value: '2026-06-15' },
  { label: 'Jul 2026', value: '2026-07-15' },
  { label: 'Aug 2026', value: '2026-08-15' },
  { label: 'Sep 2026', value: '2026-09-15' },
  { label: 'Oct 2026', value: '2026-10-15' },
  { label: 'Nov 2026', value: '2026-11-15' },
  { label: 'Dec 2026', value: '2026-12-15' },
];

const durationToNights: Record<DurationPreset, number> = {
  '2D1N': 1, '3D2N': 2, '4D3N': 3, '5D4N': 4, '7D6N': 6,
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateDisplay = (date: Date): string => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const reasonIcons: Record<string, string> = {
  event: 'calendar',
  season: 'sunny',
  promo: 'megaphone',
};

const getReasonIcon = (reason: string): string => {
  if (reason.includes('campaign') || reason.includes('Tourism')) return 'megaphone';
  if (reason.includes('season') || reason.includes('Peak') || reason.includes('Best time')) return 'sunny';
  return 'calendar';
};

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wizard, setWizardStep, updateWizard, suggestDestination } = useTripStore();
  const [showExactDates, setShowExactDates] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date(2026, 3, 15));
  const [showStartPicker, setShowStartPicker] = useState(Platform.OS === 'ios');
  const [destPickerView, setDestPickerView] = useState<'list' | 'map'>('list');

  const customEndDate = useMemo(() => {
    const nights = durationToNights[wizard.duration] || 2;
    return addDays(customStartDate, nights);
  }, [customStartDate, wizard.duration]);

  const handleGenerate = async () => {
    router.push('/(tabs)/explore/loading');
  };

  const handleSuggestDestination = () => {
    hapticSelection();
    suggestDestination();
    setWizardStep(3);
  };

  const renderStep = () => {
    switch (wizard.step) {
      // Step 1: Budget (was step 3)
      case 1:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your budget?</Text>
            <Text style={styles.stepSubtitle}>Per person budget in MYR</Text>

            <Card style={styles.budgetCard}>
              <Text style={styles.budgetAmount}>{formatCurrency(wizard.budget)}</Text>
              <Text style={styles.budgetPer}>per person</Text>
              <View style={styles.budgetButtons}>
                {[500, 1000, 2000, 3500, 5000, 10000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[styles.budgetBtn, wizard.budget === amount && styles.budgetBtnActive]}
                    onPress={() => { hapticSelection(); updateWizard({ budget: amount }); }}
                  >
                    <Text style={[styles.budgetBtnText, wizard.budget === amount && styles.budgetBtnTextActive]}>
                      {amount >= 1000 ? `${amount / 1000}K` : amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Text style={[styles.stepTitle, { marginTop: Spacing.xl }]}>Travelers</Text>
            {(['adults', 'children', 'infants'] as const).map((type) => (
              <View key={type} style={styles.travelerRow}>
                <Text style={styles.travelerLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => updateWizard({ [type]: Math.max(type === 'adults' ? 1 : 0, wizard[type] - 1) })}
                  >
                    <Ionicons name="remove" size={20} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{wizard[type]}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => updateWizard({ [type]: wizard[type] + 1 })}
                  >
                    <Ionicons name="add" size={20} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        );

      // Step 2: When & how long (unchanged content, with new exact dates + suggest CTA)
      case 2:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>When & how long?</Text>
            <Text style={styles.stepSubtitle}>Set your trip duration and travel dates</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              <Text style={styles.fieldLabel}>Duration</Text>
              <View style={styles.durationRow}>
                {durationPresets.map((dur) => (
                  <TouchableOpacity
                    key={dur}
                    style={[styles.durationChip, wizard.duration === dur && styles.durationChipActive]}
                    onPress={() => { hapticSelection(); updateWizard({ duration: dur }); }}
                  >
                    <Text style={[styles.durationChipText, wizard.duration === dur && styles.durationChipTextActive]}>{dur}</Text>
                    <Text style={[styles.durationChipSub, wizard.duration === dur && styles.durationChipSubActive]}>
                      {formatDurationLabel(dur)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>Travel Month</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll} contentContainerStyle={{ gap: Spacing.xs }}>
                {travelMonths.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.monthChip, wizard.startDate === m.value && styles.monthChipActive]}
                    onPress={() => { hapticSelection(); updateWizard({ startDate: m.value }); }}
                  >
                    <Text style={[styles.monthChipText, wizard.startDate === m.value && styles.monthChipTextActive]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Exact dates checkbox */}
              <TouchableOpacity
                style={styles.exactDateRow}
                onPress={() => {
                  const next = !showExactDates;
                  setShowExactDates(next);
                  if (next) {
                    // When toggling on, sync wizard with custom date
                    updateWizard({ startDate: toISODate(customStartDate), exactDate: toISODate(customStartDate) });
                    if (Platform.OS === 'android') setShowStartPicker(true);
                  }
                }}
              >
                <Ionicons
                  name={showExactDates ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={showExactDates ? Colors.primary : Colors.textTertiary}
                />
                <Text style={styles.exactDateLabel}>I have specific dates</Text>
              </TouchableOpacity>

              {showExactDates && (
                <View style={styles.exactDateSection}>
                  {/* Start date */}
                  <View style={styles.datePickerRow}>
                    <View style={styles.datePickerLabel}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                      <Text style={styles.datePickerLabelText}>Start Date</Text>
                    </View>
                    {Platform.OS === 'android' && (
                      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowStartPicker(true)}>
                        <Text style={styles.datePickerButtonText}>{formatDateDisplay(customStartDate)}</Text>
                        <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                    {(Platform.OS === 'ios' || showStartPicker) && (
                      <DateTimePicker
                        value={customStartDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'compact' : 'default'}
                        minimumDate={new Date()}
                        onChange={(event: DateTimePickerEvent, date?: Date) => {
                          if (Platform.OS === 'android') setShowStartPicker(false);
                          if (date) {
                            setCustomStartDate(date);
                            updateWizard({ startDate: toISODate(date), exactDate: toISODate(date) });
                          }
                        }}
                        style={Platform.OS === 'ios' ? { marginLeft: 'auto' } : undefined}
                        accentColor={Colors.primary}
                      />
                    )}
                  </View>

                  {/* End date — auto-calculated, shown as read-only */}
                  <View style={styles.datePickerRow}>
                    <View style={styles.datePickerLabel}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.textTertiary} />
                      <Text style={styles.datePickerLabelText}>End Date</Text>
                    </View>
                    <View style={styles.endDateDisplay}>
                      <Text style={styles.endDateText}>{formatDateDisplay(customEndDate)}</Text>
                      <Text style={styles.endDateHint}>({wizard.duration})</Text>
                    </View>
                  </View>
                </View>
              )}

              <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>Departure City</Text>
              {DEPARTURE_CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityOption, wizard.departureCity === city && styles.citySelected]}
                  onPress={() => { hapticSelection(); updateWizard({ departureCity: city }); }}
                >
                  <Ionicons name="airplane-outline" size={18} color={wizard.departureCity === city ? Colors.primary : Colors.textTertiary} />
                  <Text style={[styles.cityText, wizard.departureCity === city && styles.cityTextActive]}>{city}</Text>
                  {wizard.departureCity === city && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              ))}

              {/* Suggest destination CTA */}
              <TouchableOpacity style={styles.suggestCTA} onPress={handleSuggestDestination}>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.suggestCTAText}>Let Bayu suggest your destination</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        );

      // Step 3: Where to? (was step 1, now with AI suggestion card at top)
      case 3: {
        const highlightDistricts = Array.from(
          new Set(Object.values(destinationToDistrict)),
        );
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Where do you want to go?</Text>
            <Text style={styles.stepSubtitle}>Choose a destination for your trip</Text>

            {/* List / Map toggle */}
            <View style={styles.pickerToggle}>
              {(['list', 'map'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pickerToggleBtn, destPickerView === m && styles.pickerToggleBtnActive]}
                  onPress={() => {
                    hapticSelection();
                    setDestPickerView(m);
                  }}
                >
                  <Ionicons name={m === 'list' ? 'list' : 'map'} size={14} color={destPickerView === m ? '#FFFFFF' : Colors.primary} />
                  <Text style={[styles.pickerToggleText, destPickerView === m && { color: '#FFFFFF' }]}>
                    {m === 'list' ? 'List view' : 'Map view'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              {destPickerView === 'map' && (
                <View style={{ marginBottom: Spacing.base }}>
                  <SabahMap
                    mode="plain"
                    highlightDistrictIds={highlightDistricts}
                    selectedDistrictId={
                      wizard.destination
                        ? destinationToDistrict[sabahDestinations.find((d) => d.name === wizard.destination)?.id || '']
                        : null
                    }
                    onSelectDistrict={(districtId) => {
                      const entries = Object.entries(destinationToDistrict).filter(([, d]) => d === districtId);
                      if (!entries.length) return;
                      const firstDestId = entries[0][0];
                      const dest = sabahDestinations.find((d) => d.id === firstDestId);
                      if (dest) {
                        hapticSelection();
                        updateWizard({ destination: dest.name, useBayuSuggestion: false, suggestedReasons: [] });
                      }
                    }}
                    height={380}
                  />
                  {wizard.destination && !wizard.useBayuSuggestion && (
                    <View style={styles.mapSelectedChip}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                      <Text style={styles.mapSelectedText}>Selected: {wizard.destination}</Text>
                    </View>
                  )}
                  <Text style={styles.mapHint}>Blue districts have destinations · tap to pick</Text>
                </View>
              )}

              {destPickerView === 'list' && <>

              {/* AI Suggestion Card */}
              <TouchableOpacity
                style={[styles.aiSuggestionCard, wizard.useBayuSuggestion && styles.aiSuggestionCardActive]}
                onPress={() => {
                  hapticSelection();
                  if (!wizard.useBayuSuggestion || !wizard.destination) {
                    suggestDestination();
                  } else {
                    updateWizard({ useBayuSuggestion: true });
                  }
                }}
              >
                <View style={styles.aiSuggestionHeader}>
                  <View style={styles.aiSuggestionIcon}>
                    <Ionicons name="sparkles" size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiSuggestionTitle}>Let Bayu create for you</Text>
                    <Text style={styles.aiSuggestionSubtitle}>AI-curated destination based on your budget & dates</Text>
                  </View>
                  {wizard.useBayuSuggestion && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  )}
                </View>

                {wizard.useBayuSuggestion && wizard.destination ? (
                  <View style={styles.aiSuggestionBody}>
                    <Text style={styles.aiSuggestionDest}>{wizard.destination}</Text>
                    {wizard.suggestedReasons && wizard.suggestedReasons.length > 0 && (
                      <View style={styles.reasonChips}>
                        {wizard.suggestedReasons.map((reason, i) => (
                          <View key={i} style={styles.reasonChip}>
                            <Ionicons name={getReasonIcon(reason) as any} size={12} color={Colors.primary} />
                            <Text style={styles.reasonChipText}>{reason}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : null}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.orDivider}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>or choose manually</Text>
                <View style={styles.orLine} />
              </View>

              {/* Manual destination list — grouped by district */}
              {(() => {
                const crowdColorMap: Record<string, string> = {
                  low: Colors.success,
                  moderate: Colors.warning,
                  high: Colors.sunset,
                  'very-high': Colors.error,
                };
                const crowdLabelMap: Record<string, string> = {
                  low: 'Quiet',
                  moderate: 'Steady',
                  high: 'Busy',
                  'very-high': 'Peak',
                };
                const groupOrder = ['Semporna', 'Ranau', 'Sandakan', 'Lahad Datu', 'Kudat', 'Kota Kinabalu'];
                const grouped = sabahDestinations.reduce<Record<string, typeof sabahDestinations>>((acc, d) => {
                  (acc[d.district] = acc[d.district] || []).push(d);
                  return acc;
                }, {});
                const orderedDistricts = [
                  ...groupOrder.filter((g) => grouped[g]),
                  ...Object.keys(grouped).filter((g) => !groupOrder.includes(g)),
                ];

                return orderedDistricts.map((district) => (
                  <View key={district} style={{ marginBottom: Spacing.base }}>
                    <Text style={styles.districtHeader}>{district.toUpperCase()}</Text>
                    {grouped[district].map((dest) => {
                      const selected = !wizard.useBayuSuggestion && wizard.destination === dest.name;
                      return (
                        <TouchableOpacity
                          key={dest.id}
                          style={[styles.destCard, selected && styles.destCardSelected]}
                          onPress={() => {
                            hapticSelection();
                            updateWizard({ destination: dest.name, useBayuSuggestion: false, suggestedReasons: [] });
                          }}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: dest.image }} style={styles.destThumb} contentFit="cover" />
                          <View style={styles.destCardBody}>
                            <Text style={styles.destCardName}>{dest.name}</Text>
                            <Text style={styles.destCardDesc} numberOfLines={2}>{dest.description}</Text>
                            <View style={styles.destCardMeta}>
                              <View style={styles.destMetaItem}>
                                <View style={[styles.destCrowdDot, { backgroundColor: crowdColorMap[dest.crowdLevel] }]} />
                                <Text style={styles.destMetaText}>{crowdLabelMap[dest.crowdLevel]}</Text>
                              </View>
                              <Text style={styles.destMetaDivider}>·</Text>
                              <Text style={styles.destMetaText}>{dest.tags.length} activities</Text>
                              {dest.permitRequired && (
                                <>
                                  <Text style={styles.destMetaDivider}>·</Text>
                                  <Text style={[styles.destMetaText, { color: Colors.warning }]}>Permit</Text>
                                </>
                              )}
                            </View>
                          </View>
                          {selected && (
                            <View style={styles.destCheck}>
                              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ));
              })()}

              </>}
            </ScrollView>
          </Animated.View>
        );
      }

      // Step 4: Interests & travel style (unchanged)
      case 4:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>What interests you?</Text>
            <Text style={styles.stepSubtitle}>Select your travel interests</Text>
            <View style={styles.interestsGrid}>
              {interests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  selected={wizard.interests.includes(interest)}
                  onPress={() => {
                    hapticSelection();
                    const current = wizard.interests;
                    updateWizard({
                      interests: current.includes(interest)
                        ? current.filter((i) => i !== interest)
                        : [...current, interest],
                    });
                  }}
                />
              ))}
            </View>

            <Text style={[styles.stepTitle, { marginTop: Spacing.xl }]}>Travel Style</Text>
            <View style={styles.styleCards}>
              {([
                { tier: 'budget' as TierType, icon: 'wallet-outline', title: 'Budget', desc: 'Best value for money', color: Colors.budget },
                { tier: 'comfort' as TierType, icon: 'heart-outline', title: 'Comfort', desc: 'Balanced experience', color: Colors.comfort },
                { tier: 'luxury' as TierType, icon: 'diamond-outline', title: 'Luxury', desc: 'Premium everything', color: Colors.luxury },
              ]).map((style) => (
                <TouchableOpacity
                  key={style.tier}
                  style={[styles.styleCard, wizard.travelStyle === style.tier && { borderColor: style.color, borderWidth: 2 }]}
                  onPress={() => { hapticSelection(); updateWizard({ travelStyle: style.tier }); }}
                >
                  <Ionicons name={style.icon as any} size={28} color={style.color} />
                  <Text style={[styles.styleTitle, { color: style.color }]}>{style.title}</Text>
                  <Text style={styles.styleDesc}>{style.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      // Step 5: Review (with Bayu suggestion indicator)
      case 5:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review your trip</Text>
            <Card style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Destination</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.reviewValue}>{wizard.destination || 'Not selected'}</Text>
                  {wizard.useBayuSuggestion && (
                    <View style={styles.suggestedBadge}>
                      <Ionicons name="sparkles" size={10} color={Colors.primary} />
                      <Text style={styles.suggestedBadgeText}>Suggested by Bayu</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="time" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Duration</Text>
                <Text style={styles.reviewValue}>{wizard.duration} ({formatDurationLabel(wizard.duration)})</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Travel Date</Text>
                <Text style={styles.reviewValue}>
                  {wizard.exactDate
                    ? `${formatDateDisplay(new Date(wizard.exactDate))} — ${formatDateDisplay(addDays(new Date(wizard.exactDate), durationToNights[wizard.duration] || 2))}`
                    : wizard.startDate
                      ? travelMonths.find((m) => m.value === wizard.startDate)?.label || wizard.startDate
                      : 'Not selected'}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="airplane" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>From</Text>
                <Text style={styles.reviewValue}>{wizard.departureCity}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="cash" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Budget</Text>
                <Text style={styles.reviewValue}>{formatCurrency(wizard.budget)}/pax</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="people" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Travelers</Text>
                <Text style={styles.reviewValue}>{wizard.adults}A {wizard.children > 0 ? `${wizard.children}C ` : ''}{wizard.infants > 0 ? `${wizard.infants}I` : ''}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="compass" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Style</Text>
                <Text style={styles.reviewValue}>{wizard.travelStyle.charAt(0).toUpperCase() + wizard.travelStyle.slice(1)}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="heart" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Interests</Text>
                <Text style={styles.reviewValue} numberOfLines={2}>{wizard.interests.join(', ') || 'None selected'}</Text>
              </View>
            </Card>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Plan Your Trip" showBack={wizard.step > 1} />

      <View style={styles.progressRow}>
        <ProgressBar progress={wizard.step / TOTAL_STEPS} />
        <Text style={styles.stepIndicator}>Step {wizard.step} of {TOTAL_STEPS}</Text>
      </View>

      <View style={styles.content}>
        {renderStep()}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 80 }]}>
        {wizard.step > 1 && (
          <Button title="Back" onPress={() => setWizardStep(wizard.step - 1)} variant="outline" size="lg" style={{ flex: 1, marginRight: Spacing.sm }} />
        )}
        <Button
          title={wizard.step === TOTAL_STEPS ? 'Generate with AI' : 'Continue'}
          onPress={wizard.step === TOTAL_STEPS ? handleGenerate : () => setWizardStep(wizard.step + 1)}
          size="lg"
          style={{ flex: 1 }}
          icon={wizard.step === TOTAL_STEPS ? <Ionicons name="sparkles" size={18} color="#fff" /> : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressRow: { paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  stepIndicator: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, textAlign: 'right', marginTop: Spacing.xs },
  content: { flex: 1 },
  stepContent: { flex: 1, paddingHorizontal: Spacing.base },
  stepTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.xs },
  stepSubtitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  fieldLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.sm },
  destOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: Spacing.sm },
  destSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  destInfo: { flex: 1 },
  destName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  destDesc: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  districtHeader: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  destCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.sm,
    paddingRight: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  destCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  destThumb: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
  },
  destCardBody: { flex: 1, gap: 2 },
  destCardName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  destCardDesc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.xs * 1.4,
  },
  destCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  destMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  destCrowdDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  destMetaText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textSecondary,
  },
  destMetaDivider: {
    color: Colors.textTertiary,
    fontSize: Typography.sizes.xs,
  },
  destCheck: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  durationChip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', minWidth: 80 },
  durationChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  durationChipText: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  durationChipTextActive: { color: Colors.primary },
  durationChipSub: { fontSize: 10, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 2 },
  durationChipSubActive: { color: Colors.primary },
  monthScroll: { marginBottom: Spacing.sm },
  monthChip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  monthChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  monthChipText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  monthChipTextActive: { color: '#FFFFFF' },
  cityOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: Spacing.sm, gap: Spacing.sm },
  citySelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  cityText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  cityTextActive: { color: Colors.primary, fontFamily: Typography.fonts.bodySemiBold },
  budgetCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  budgetAmount: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  budgetPer: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  budgetButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg, justifyContent: 'center' },
  budgetBtn: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  budgetBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  budgetBtnText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  budgetBtnTextActive: { color: '#FFFFFF' },
  travelerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  travelerLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  counterBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, minWidth: 24, textAlign: 'center' },
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  styleCards: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  styleCard: { flex: 1, alignItems: 'center', padding: Spacing.base, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, gap: Spacing.xs },
  styleTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.heading },
  styleDesc: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, textAlign: 'center' },
  reviewCard: { gap: Spacing.md },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, width: 80 },
  reviewValue: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, textAlign: 'right' },
  footer: { flexDirection: 'row', paddingHorizontal: Spacing.base, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  // Exact date styles
  exactDateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, marginBottom: Spacing.sm },
  exactDateLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  exactDateSection: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md, gap: Spacing.md },
  datePickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  datePickerLabel: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  datePickerLabelText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.primary + '10', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  datePickerButtonText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  endDateDisplay: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  endDateText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  endDateHint: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  // Suggest CTA
  suggestCTA: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, marginTop: Spacing.xl },
  suggestCTAText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  // AI Suggestion card
  aiSuggestionCard: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md, backgroundColor: Colors.surface },
  aiSuggestionCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  aiSuggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiSuggestionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  aiSuggestionTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  aiSuggestionSubtitle: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 1 },
  aiSuggestionBody: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  aiSuggestionDest: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.primary, marginBottom: Spacing.sm },
  reasonChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  reasonChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '10', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  reasonChipText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },
  // Or divider
  orDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  pickerToggle: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.base, backgroundColor: Colors.surface, padding: 4, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  pickerToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  pickerToggleBtnActive: { backgroundColor: Colors.primary },
  pickerToggleText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  mapSelectedChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: Spacing.sm, paddingVertical: Spacing.sm, backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.primary + '40' },
  mapSelectedText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  mapHint: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm, fontStyle: 'italic' },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  orText: { marginHorizontal: Spacing.md, fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  // Suggested badge in review
  suggestedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  suggestedBadgeText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },
});
