import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface SettingsToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SettingsToggleRow({ label, description, value, onValueChange }: SettingsToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.red }}
        thumbColor={colors.cream}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.cream,
    fontSize: 17,
    fontWeight: '600',
  },
  description: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 13,
    lineHeight: 18,
  },
});
