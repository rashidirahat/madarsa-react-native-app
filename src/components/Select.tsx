import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  testID,
}: SelectProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const listRef = useRef<FlatList<SelectOption>>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = options.findIndex((o) => o.value === value);
    if (selectedIndex >= 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index: selectedIndex, animated: false });
      });
    }
  }, [open, options, value]);

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text> : null}
      <Pressable
        testID={testID}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : colors.border,
            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Select'}
      >
        <Text
          style={[
            styles.triggerText,
            { color: selected ? colors.textPrimary : colors.placeholder },
          ]}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
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
                {label ?? 'Select an option'}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              ref={listRef}
              data={options}
              keyExtractor={(item) => item.value}
              onScrollToIndexFailed={() => undefined}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && { backgroundColor: colors.brandSoft },
                      pressed && { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? colors.brand : colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.brand} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
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
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  triggerText: {
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
    maxHeight: 480,
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
