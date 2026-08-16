import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface OptionPickerProps<T extends string> {
  label: string;
  options: Array<{
    value: T;
    title: string;
    subtitle?: string;
    disabled?: boolean;
    badge?: string;
  }>;
  value: T;
  onChange: (value: T) => void;
}

export function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionPickerProps<T>) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.list}>
        {options.map((option) => {
          const selected = option.value === value;
          const disabled = option.disabled ?? false;

          return (
            <Pressable
              key={option.value}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                selected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
            >
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                  {option.title}
                </Text>
                {option.subtitle ? (
                  <Text style={[styles.optionSubtitle, selected && styles.optionSubtitleSelected]}>
                    {option.subtitle}
                  </Text>
                ) : null}
              </View>
              {option.badge ? <Text style={styles.badge}>{option.badge}</Text> : null}
              {selected ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  label: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201, 162, 39, 0.12)',
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.cream,
    fontSize: 17,
    fontWeight: '600',
  },
  optionTitleSelected: {
    color: colors.gold,
  },
  optionSubtitle: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 13,
    lineHeight: 18,
  },
  optionSubtitleSelected: {
    opacity: 0.85,
  },
  badge: {
    color: colors.cream,
    opacity: 0.7,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  check: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '700',
  },
});
