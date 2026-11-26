import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CapturedPhoto {
  uri: string;
  width?: number;
  height?: number;
}

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  // Camera permissions & state
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({
    writeOnly: true,
  });

  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Photos & preview
  const [lastPhoto, setLastPhoto] = useState<CapturedPhoto | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<CapturedPhoto | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Shutter flash animation
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const triggerShutterAnimation = () => {
    flashOpacity.setValue(0.7);
    Animated.timing(flashOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  // Toggle flash: off -> on -> auto
  const handleToggleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  // Toggle camera direction
  const handleFlipCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Toggle zoom: 0x -> 0.05 (2x equivalent)
  const handleToggleZoom = () => {
    setZoom((current) => (current === 0 ? 0.06 : 0));
  };

  // Capture photo
  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      triggerShutterAnimation();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        Alert.alert('Capture Error', 'Could not capture image.');
        return;
      }

      const newPhoto: CapturedPhoto = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
      };

      setLastPhoto(newPhoto);
      setPreviewPhoto(newPhoto);
      setIsSaved(false);

      // Auto-save to gallery in background
      savePhotoToLibrary(newPhoto.uri, false);
    } catch (err: any) {
      console.error('Error taking picture:', err);
      Alert.alert('Error', err?.message || 'Failed to capture photo.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Save to device gallery
  const savePhotoToLibrary = async (uri: string, showNotification = true) => {
    try {
      setIsSaving(true);
      if (!mediaPermission?.granted) {
        const result = await requestMediaPermission();
        if (!result.granted) {
          if (showNotification) {
            Alert.alert(
              'Permission Required',
              'Please grant media library access to save photos to your gallery.'
            );
          }
          return;
        }
      }

      await MediaLibrary.Asset.create(uri);
      setIsSaved(true);
      if (showNotification) {
        Alert.alert('Success', 'Photo saved to your gallery!');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      if (showNotification) {
        Alert.alert('Save Failed', err?.message || 'Failed to save photo.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (!cameraPermission) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Permission Request Screen
  if (!cameraPermission.granted) {
    return (
      <View style={[styles.permissionContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.permissionIconBadge}>
          <Ionicons name="camera" size={54} color="#007AFF" />
        </View>

        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionMessage}>
          To capture and save high-resolution photos, please grant camera permissions to this app.
        </Text>

        <TouchableOpacity style={styles.grantButton} activeOpacity={0.8} onPress={requestCameraPermission}>
          <Ionicons name="lock-open-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.grantButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getFlashIcon = () => {
    switch (flash) {
      case 'on':
        return 'flash';
      case 'auto':
        return 'flash-auto';
      default:
        return 'flash-off';
    }
  };

  return (
    <View style={styles.container}>
      {/* Live Camera View */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        zoom={zoom}
      />

      {/* Grid Overlay */}
      {showGrid && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridBorderRight, styles.gridBorderBottom]} />
            <View style={[styles.gridCell, styles.gridBorderRight, styles.gridBorderBottom]} />
            <View style={[styles.gridCell, styles.gridBorderBottom]} />
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridBorderRight, styles.gridBorderBottom]} />
            <View style={[styles.gridCell, styles.gridBorderRight, styles.gridBorderBottom]} />
            <View style={[styles.gridCell, styles.gridBorderBottom]} />
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.gridBorderRight]} />
            <View style={[styles.gridCell, styles.gridBorderRight]} />
            <View style={styles.gridCell} />
          </View>
        </View>
      )}

      {/* Shutter White Flash Animation */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.shutterFlash,
          { opacity: flashOpacity },
        ]}
      />

      {/* Top Floating Glass Toolbar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 8, 20) }]}>
        <View style={styles.glassContainer}>
          {/* Flash Toggle */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleToggleFlash}
          >
            <MaterialCommunityIcons
              name={getFlashIcon()}
              size={22}
              color={flash === 'on' ? '#FFD700' : flash === 'auto' ? '#00E5FF' : '#FFFFFF'}
            />
          </TouchableOpacity>

          {/* Grid Toggle */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => setShowGrid(!showGrid)}
          >
            <Ionicons
              name={showGrid ? 'grid' : 'grid-outline'}
              size={20}
              color={showGrid ? '#007AFF' : '#FFFFFF'}
            />
          </TouchableOpacity>

          {/* Zoom Toggle */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleToggleZoom}
          >
            <Text style={[styles.zoomText, zoom > 0 && styles.zoomActive]}>
              {zoom > 0 ? '2x' : '1x'}
            </Text>
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleFlipCamera}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Controls Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        {/* Left: Thumbnail of last captured photo */}
        <View style={styles.sideControlSlot}>
          {lastPhoto ? (
            <TouchableOpacity
              style={styles.thumbnailWrapper}
              activeOpacity={0.8}
              onPress={() => setPreviewPhoto(lastPhoto)}
            >
              <Image source={{ uri: lastPhoto.uri }} style={styles.thumbnailImage} contentFit="cover" />
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyThumbnailPlaceholder} />
          )}
        </View>

        {/* Center: Pro Shutter Button */}
        <TouchableOpacity
          style={styles.shutterOuterRing}
          activeOpacity={0.7}
          disabled={isCapturing}
          onPress={handleCapture}
        >
          <View style={[styles.shutterInnerButton, isCapturing && styles.shutterCapturing]}>
            {isCapturing && <ActivityIndicator color="#007AFF" size="small" />}
          </View>
        </TouchableOpacity>

        {/* Right: Camera Flip shortcut */}
        <View style={styles.sideControlSlot}>
          <TouchableOpacity
            style={styles.circleActionButton}
            activeOpacity={0.7}
            onPress={handleFlipCamera}
          >
            <Ionicons name="sync-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Full-Screen Photo Preview & Review Modal */}
      {previewPhoto && (
        <Modal
          visible={!!previewPhoto}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setPreviewPhoto(null)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                activeOpacity={0.7}
                onPress={() => setPreviewPhoto(null)}
              >
                <Ionicons name="close" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Photo Review</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Photo View */}
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: previewPhoto.uri }}
                style={styles.previewImage}
                contentFit="contain"
                transition={200}
              />
            </View>

            {/* Modal Bottom Actions */}
            <View style={styles.modalBottomBar}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.discardButton]}
                activeOpacity={0.7}
                onPress={() => setPreviewPhoto(null)}
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.modalActionText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalActionButton,
                  styles.saveButton,
                  isSaved && styles.savedSuccessButton,
                ]}
                activeOpacity={0.8}
                disabled={isSaving || isSaved}
                onPress={() => savePhotoToLibrary(previewPhoto.uri, true)}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={isSaved ? 'checkmark-circle' : 'cloud-download-outline'}
                      size={20}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.modalActionText}>
                      {isSaved ? 'Saved to Gallery' : 'Save to Gallery'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterFlash: {
    backgroundColor: '#FFFFFF',
  },

  /* Permission View */
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 122, 255, 0.25)',
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionMessage: {
    color: '#A0A0A5',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  grantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Grid Overlay */
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
  },
  gridBorderRight: {
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255, 255, 255, 0.25)',
  },
  gridBorderBottom: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
  },

  /* Top Toolbar */
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 20, 25, 0.65)',
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '88%',
  },
  iconButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  zoomActive: {
    color: '#007AFF',
  },

  /* Bottom Controls Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sideControlSlot: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  emptyThumbnailPlaceholder: {
    width: 54,
    height: 54,
  },
  shutterOuterRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  shutterInnerButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterCapturing: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  circleActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(30, 30, 35, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Full Screen Preview Modal */
  modalContainer: {
    flex: 1,
    backgroundColor: '#050507',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  modalImageContainer: {
    flex: 1,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  modalBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 28,
  },
  discardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  savedSuccessButton: {
    backgroundColor: '#34C759',
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
