import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../theme';
import { Button } from './Button';

interface PermissionModalProps {
  visible: boolean;
  title: string;
  description: string;
  icon: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  title,
  description,
  icon,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <Button title="Allow Permission" onPress={onAccept} style={styles.btn} />
          <TouchableOpacity onPress={onDecline} style={styles.declineBtn}>
            <Text style={styles.declineText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    marginBottom: 12,
  },
  declineBtn: {
    padding: 8,
  },
  declineText: {
    fontSize: 14,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    fontWeight: '600',
  },
});
