import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ModalType = 'bottom' | 'center';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  type?: ModalType;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  type = 'bottom',
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <View
        style={[
          styles.container,
          type === 'bottom' ? styles.bottomSheet : styles.centerModal,
        ]}
      >
        {type === 'bottom' && (
          <View style={styles.handle} />
        )}
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  bottomSheet: {
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  centerModal: {
    marginHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    ...fonts.bold,
  },
});

export default Modal;
