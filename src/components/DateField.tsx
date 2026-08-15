import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { formatDate } from '@/utils/format';

export interface DateFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  testID?: string;
}

function toDateValue(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  error,
  maximumDate,
  minimumDate,
  testID,
}: DateFieldProps) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);
  const date = toDateValue(value);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type !== 'dismissed' && selected) {
        onChange(toISODate(selected));
      }
    } else if (selected) {
      onChange(toISODate(selected));
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text> : null}
      <Pressable
        testID={testID}
        onPress={() => setShow(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
        <Text
          style={[
            styles.triggerText,
            { color: date ? colors.textPrimary : colors.placeholder },
          ]}
        >
          {date ? formatDate(date) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShow(false)}>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                  {label ?? 'Select a date'}
                </Text>
                <Pressable onPress={() => setShow(false)} hitSlop={8}>
                  <Text style={[styles.doneText, { color: colors.brand }]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={date ?? new Date()}
                mode="date"
                display="inline"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={handleChange}
              />
            </View>
          </Pressable>
        </Modal>
      ) : show ? (
        <DateTimePicker
          value={date ?? new Date()}
          mode="date"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
  },
  error: {
    fontSize: 12,
    fontWeight: '500',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
