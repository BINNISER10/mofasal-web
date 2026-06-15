import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { colors, spacing } from '../../utils/theme';
import { MEASUREMENT_ZONES } from '../../utils/constants';

interface BodyDiagramProps {
  activeZone?: string;
  onZonePress: (zoneId: string) => void;
}

const BodyDiagram: React.FC<BodyDiagramProps> = ({ activeZone, onZonePress }) => {
  return (
    <View style={styles.container}>
      <Svg width={200} height={320} viewBox="0 0 200 320">
        {/* الرأس */}
        <Circle cx={100} cy={30} r={20} fill={activeZone === 'neck_shoulder' ? '#1A6470' : '#E5E5E5'} />
        
        {/* الرقبة والكتف */}
        <TouchableOpacity onPress={() => onZonePress('neck_shoulder')} style={styles.zoneTouch}>
          <Path
            d="M85 50 L115 50 L130 70 L70 70 Z"
            fill={activeZone === 'neck_shoulder' ? '#1A6470' : '#E5E5E5'}
            opacity={activeZone === 'neck_shoulder' ? 1 : 0.6}
          />
        </TouchableOpacity>

        {/* الصدر والجذع */}
        <TouchableOpacity onPress={() => onZonePress('chest_torso')} style={styles.zoneTouch}>
          <Path
            d="M70 70 L130 70 L140 150 L60 150 Z"
            fill={activeZone === 'chest_torso' ? '#00373E' : '#E5E5E5'}
            opacity={activeZone === 'chest_torso' ? 1 : 0.6}
          />
        </TouchableOpacity>

        {/* الأكمام اليسرى */}
        <TouchableOpacity onPress={() => onZonePress('sleeves')} style={styles.zoneTouch}>
          <Path
            d="M70 70 L40 90 L35 160 L55 160 L60 150"
            fill={activeZone === 'sleeves' ? '#D4AF37' : '#E5E5E5'}
            opacity={activeZone === 'sleeves' ? 1 : 0.6}
          />
        </TouchableOpacity>

        {/* الأكمام اليمنى */}
        <TouchableOpacity onPress={() => onZonePress('sleeves')} style={styles.zoneTouch}>
          <Path
            d="M130 70 L160 90 L165 160 L145 160 L140 150"
            fill={activeZone === 'sleeves' ? '#D4AF37' : '#E5E5E5'}
            opacity={activeZone === 'sleeves' ? 1 : 0.6}
          />
        </TouchableOpacity>

        {/* الخصر والأرداف */}
        <TouchableOpacity onPress={() => onZonePress('waist_hips')} style={styles.zoneTouch}>
          <Path
            d="M60 150 L140 150 L150 220 L50 220 Z"
            fill={activeZone === 'waist_hips' ? '#481719' : '#E5E5E5'}
            opacity={activeZone === 'waist_hips' ? 1 : 0.6}
          />
        </TouchableOpacity>

        {/* الأرجل اليسرى */}
        <TouchableOpacity onPress={() => onZonePress('legs')} style={styles.zoneTouch}>
          <Path
            d="M50 220 L45 310 L75 310 L80 220"
            fill={activeZone === 'legs' ? '#735B4D' : '#E5E5E5'}
            opacity={activeZone === 'legs' ? 1 : 0.6}
          />
        </TouchableOpacity>

        {/* الأرجل اليمنى */}
        <TouchableOpacity onPress={() => onZonePress('legs')} style={styles.zoneTouch}>
          <Path
            d="M150 220 L155 310 L125 310 L120 220"
            fill={activeZone === 'legs' ? '#735B4D' : '#E5E5E5'}
            opacity={activeZone === 'legs' ? 1 : 0.6}
          />
        </TouchableOpacity>

        {/* نقاط توضيحية للمناطق */}
        {MEASUREMENT_ZONES.map((zone) => (
          <G key={zone.id}>
            <Circle
              cx={zone.id === 'neck_shoulder' ? 100 : 
                 zone.id === 'chest_torso' ? 100 :
                 zone.id === 'sleeves' ? 50 :
                 zone.id === 'waist_hips' ? 100 : 60}
              cy={zone.id === 'neck_shoulder' ? 60 : 
                 zone.id === 'chest_torso' ? 110 :
                 zone.id === 'sleeves' ? 115 :
                 zone.id === 'waist_hips' ? 185 : 265}
              r={activeZone === zone.id ? 8 : 5}
              fill={zone.color}
              stroke={colors.white}
              strokeWidth={2}
            />
          </G>
        ))}
      </Svg>

      {/* أسطورة الألوان */}
      <View style={styles.legend}>
        {MEASUREMENT_ZONES.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            style={[styles.legendItem, activeZone === zone.id && styles.legendItemActive]}
            onPress={() => onZonePress(zone.id)}
          >
            <View style={[styles.legendDot, { backgroundColor: zone.color }]} />
            <Text style={styles.legendText}>{zone.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  zoneTouch: {
    // شفاف للنقر
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendItemActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});

export default BodyDiagram;
