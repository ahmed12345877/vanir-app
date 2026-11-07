import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react-native';

export interface VipFlexibleDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  initialDate?: string; // YYYY-MM-DD
  title?: string;
  mode?: 'calendar' | 'past' | 'dob' | 'future';
  minYear?: number;
  maxYear?: number;
}



const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseSafeYmd(dateStr?: string): { year: number; month: number; day: number } {
  if (dateStr) {
    const m = dateStr.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) {
      const y = parseInt(m[1], 10);
      const mo = Math.min(11, Math.max(0, parseInt(m[2], 10) - 1));
      const d = Math.min(31, Math.max(1, parseInt(m[3], 10)));
      return { year: y, month: mo, day: d };
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return {
        year: parsed.getFullYear(),
        month: parsed.getMonth(),
        day: parsed.getDate(),
      };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

export function VipFlexibleDatePickerModal({
  visible,
  onClose,
  onSelectDate,
  initialDate,
  title = 'Select Date',
  mode = 'calendar',
  minYear = 1945,
  maxYear = 2038,
}: VipFlexibleDatePickerModalProps) {
  const parsed = useMemo(() => parseSafeYmd(initialDate), [initialDate]);

  const [currentYear, setCurrentYear] = useState(parsed.year);
  const [currentMonth, setCurrentMonth] = useState(parsed.month);
  const [selectedDay, setSelectedDay] = useState(parsed.day);

  // Picker tab for past/dob/future modes: 'year' | 'month' | 'calendar'
  const [pickerTab, setPickerTab] = useState<'calendar' | 'year' | 'month'>(
    mode === 'past' || mode === 'dob' || mode === 'future' ? 'year' : 'calendar',
  );

  useEffect(() => {
    if (visible) {
      const p = parseSafeYmd(initialDate);
      setCurrentYear(p.year);
      setCurrentMonth(p.month);
      setSelectedDay(p.day);
      setPickerTab(
        mode === 'past' || mode === 'dob' || mode === 'future' ? 'year' : 'calendar',
      );
    }
  }, [visible, initialDate, mode]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Generate Year Range
  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  const handleConfirm = (day: number) => {
    setSelectedDay(day);
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${m}-${d}`;
    onSelectDate(formatted);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CalendarIcon color="#D4AF37" size={20} strokeWidth={2.2} />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X color="#64748B" size={20} />
            </Pressable>
          </View>

          {/* Current Selection Ribbon */}
          <View style={styles.ribbonRow}>
            <Pressable
              style={[styles.ribbonPill, pickerTab === 'year' && styles.ribbonPillActive]}
              onPress={() => setPickerTab('year')}
            >
              <Text style={[styles.ribbonPillText, pickerTab === 'year' && styles.ribbonPillTextActive]}>
                Year: {currentYear}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.ribbonPill, pickerTab === 'month' && styles.ribbonPillActive]}
              onPress={() => setPickerTab('month')}
            >
              <Text style={[styles.ribbonPillText, pickerTab === 'month' && styles.ribbonPillTextActive]}>
                Month: {MONTHS_EN[currentMonth]}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.ribbonPill, pickerTab === 'calendar' && styles.ribbonPillActive]}
              onPress={() => setPickerTab('calendar')}
            >
              <Text style={[styles.ribbonPillText, pickerTab === 'calendar' && styles.ribbonPillTextActive]}>
                Day: {selectedDay}
              </Text>
            </Pressable>
          </View>

          {/* TAB 1: YEAR SELECTOR */}
          {pickerTab === 'year' && (
            <View style={{ height: 260 }}>
              <Text style={styles.tabHint}>Select Year:</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
                {yearsList.map(y => (
                  <Pressable
                    key={`year-${y}`}
                    style={[styles.chip, currentYear === y && styles.chipActive]}
                    onPress={() => {
                      setCurrentYear(y);
                      setPickerTab('month');
                    }}
                  >
                    <Text style={[styles.chipText, currentYear === y && styles.chipTextActive]}>{y}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* TAB 2: MONTH SELECTOR */}
          {pickerTab === 'month' && (
            <View style={{ height: 260 }}>
              <Text style={styles.tabHint}>Select Month:</Text>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
                {MONTHS_EN.map((mName, idx) => (
                  <Pressable
                    key={`month-${idx}`}
                    style={[styles.chipWide, currentMonth === idx && styles.chipActive]}
                    onPress={() => {
                      setCurrentMonth(idx);
                      setPickerTab('calendar');
                    }}
                  >
                    <Text style={[styles.chipText, currentMonth === idx && styles.chipTextActive]}>{mName}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* TAB 3: CALENDAR DAYS */}
          {pickerTab === 'calendar' && (
            <View>
              {/* Month Navigation */}
              <View style={styles.monthNavRow}>
                <Pressable
                  onPress={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(y => y - 1);
                    } else {
                      setCurrentMonth(m => m - 1);
                    }
                  }}
                  style={styles.navBtn}
                >
                  <ChevronLeft color="#1C1917" size={20} />
                </Pressable>
                <Pressable onPress={() => setPickerTab('year')} style={{ alignItems: 'center' }}>
                  <Text style={styles.monthYearText}>
                    {MONTHS_EN[currentMonth]} {currentYear}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#D4AF37', fontWeight: '700' }}>Tap to change year or month</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(y => y + 1);
                    } else {
                      setCurrentMonth(m => m + 1);
                    }
                  }}
                  style={styles.navBtn}
                >
                  <ChevronRight color="#1C1917" size={20} />
                </Pressable>
              </View>

              {/* Weekday Labels */}
              <View style={styles.weekdaysRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
                  <Text key={w} style={styles.weekdayLabel} numberOfLines={1}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCellEmpty} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = day === selectedDay;

                  return (
                    <Pressable
                      key={`day-${day}`}
                      style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                      onPress={() => handleConfirm(day)}
                    >
                      <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    width: '100%',
    maxWidth: 390,
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    gap: 6,
  },
  ribbonPill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ribbonPillActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  ribbonPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  ribbonPillTextActive: {
    color: '#FFFFFF',
  },
  tabHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 70,
    alignItems: 'center',
  },
  chipWide: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '48%',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#1C1917',
    borderColor: '#D4AF37',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 38,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayCellSelected: {
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
