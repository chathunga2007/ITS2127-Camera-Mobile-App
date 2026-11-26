import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const App = () => {
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<CameraView>(null);
  const [mediaPermissionResponse, requestMediaPermission] = MediaLibrary.usePermissions({
    writeOnly: true,
  });

  if (!cameraPermission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!cameraPermission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleFlipCamera = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      if (!mediaPermissionResponse?.granted) {
        const result = await requestMediaPermission();
        if (!result.granted) {
          Alert.alert('Permission required', 'We need your permission to save the photo to your media library.');
          return;
        }
      }

      const photo = await cameraRef.current.takePictureAsync();
      if (!photo?.uri) {
        Alert.alert('Error', 'Failed to capture photo.');
        return;
      }

      await MediaLibrary.Asset.create(photo.uri);
      Alert.alert('Success', 'Photo saved to your gallery!');
    } catch (error: any) {
      console.error('Error taking/saving picture:', error);
      Alert.alert('Error', error?.message || 'Failed to save photo.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleFlipCamera}>
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.captureButton]} onPress={takePicture}>
          <Text style={styles.buttonText}>Take Picture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  captureButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default App;