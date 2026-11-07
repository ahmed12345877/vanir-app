import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Check,
} from 'lucide-react-native';

export interface VipDatePickerModalProps {
  visible: boolean;
  initialDate?: string; // YYYY-MM-DD
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  title?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function VipDatePickerModal({
  visible,
  initialDate,
  onClose,
  onSelectDate,
  title = 'Select Reservation Date',
}: VipDatePickerModalProps) {
  const parseYmd = (str?: string) => {
    if (str) {
      const m = str.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (m) {
        return {
          y: parseInt(m[1], 10),
          mo: Math.min(11, Math.max(0, parseInt(m[2], 10) - 1)),
          d: Math.min(31, Math.max(1, parseInt(m[3], 10))),
        };
      }
      const dt = new Date(str);
      if (!isNaN(dt.getTime())) {
        return { y: dt.getFullYear(), mo: dt.getMonth(), d: dt.getDate() };
      }
    }
    const now = new Date();
    return { y: now.getFullYear(), mo: now.getMonth(), d: now.getDate() };
  };

  const init = parseYmd(initialDate);
  const [currentYear, setCurrentYear] = useState(init.y);
  const [currentMonth, setCurrentMonth] = useState(init.mo);
  const [selectedDay, setSelectedDay] = useState(init.d);

  useEffect(() => {
    if (visible) {
      const p = parseYmd(initialDate);
      setCurrentYear(p.y);
      setCurrentMonth(p.mo);
      setSelectedDay(p.d);
    }
  }, [visible, initialDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleConfirmDate = (day: number) => {
    setSelectedDay(day);
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${m}-${d}`;
    onSelectDate(formatted);
    onClose();
  };

  // Quick Presets
  const handleQuickPreset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    onSelectDate(formatted);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CalendarIcon color="#D4AF37" size={20} strokeWidth={2} />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X color="#64748B" size={20} />
            </Pressable>
          </View>

          {/* Quick Presets Strip */}
          <View style={styles.presetsRow}>
            <Pressable style={styles.presetChip} onPress={() => handleQuickPreset(0)}>
              <Text style={styles.presetChipText}>Today</Text>
            </Pressable>
            <Pressable style={styles.presetChip} onPress={() => handleQuickPreset(1)}>
              <Text style={styles.presetChipText}>Tomorrow</Text>
            </Pressable>
            <Pressable style={styles.presetChip} onPress={() => handleQuickPreset(3)}>
              <Text style={styles.presetChipText}>In 3 Days</Text>
            </Pressable>
            <Pressable style={styles.presetChip} onPress={() => handleQuickPreset(7)}>
              <Text style={styles.presetChipText}>Next Week</Text>
            </Pressable>
          </View>

          {/* Month & Year Navigation */}
          <View style={styles.monthNavRow}>
            <Pressable onPress={handlePrevMonth} style={styles.navBtn}>
              <ChevronLeft color="#1C1917" size={20} />
            </Pressable>
            <Text style={styles.monthYearText}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <Pressable onPress={handleNextMonth} style={styles.navBtn}>
              <ChevronRight color="#1C1917" size={20} />
            </Pressable>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdaysRow}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => (
              <Text key={w} style={styles.weekdayLabel}>{w}</Text>
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
                  onPress={() => handleConfirmDate(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FAF9F6',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  closeBtn: {
    padding: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1917',
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCellEmpty: {
    width: 38,
    height: 38,
    margin: 2,
  },
  dayCell: {
    width: 38,
    height: 38,
    margin: 2,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dayCellSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
