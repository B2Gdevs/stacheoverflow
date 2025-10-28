import { BeatData, PackData, WizardMode } from '@/lib/wizard';

// API submission functions
export async function submitSingleBeat(beat: BeatData, mode: WizardMode) {
  console.log('🎵 submitSingleBeat: Starting submission for beat:', beat);
  console.log('🎵 submitSingleBeat: Mode:', mode);
  
  const formData = new FormData();
  
  // Add beat data
  formData.append('title', beat.title);
  formData.append('artist', beat.artist);
  formData.append('genre', beat.genre);
  formData.append('price', beat.price.toString());
  formData.append('duration', beat.duration);
  formData.append('bpm', beat.bpm.toString());
  formData.append('key', beat.key);
  formData.append('description', beat.description);
  formData.append('category', beat.category);
  formData.append('tags', JSON.stringify(beat.tags));
  formData.append('published', beat.published.toString());
  
  console.log('🎵 submitSingleBeat: Beat metadata added to FormData');
  
  // Add audio files
  if (beat.audioFiles.mp3) {
    console.log('🎵 submitSingleBeat: Adding MP3 file:', beat.audioFiles.mp3.name);
    formData.append('mp3File', beat.audioFiles.mp3);
  }
  if (beat.audioFiles.wav) {
    console.log('🎵 submitSingleBeat: Adding WAV file:', beat.audioFiles.wav.name);
    formData.append('wavFile', beat.audioFiles.wav);
  } else {
    console.log('🎵 submitSingleBeat: No WAV file to upload');
  }
  if (beat.audioFiles.stems) {
    console.log('🎵 submitSingleBeat: Adding Stems file:', beat.audioFiles.stems.name);
    formData.append('stemsFile', beat.audioFiles.stems);
  }
  
  // Add cover image
  if (beat.imageFile) {
    console.log('🎵 submitSingleBeat: Adding image file:', beat.imageFile.name);
    formData.append('imageFile', beat.imageFile);
  }

  const url = mode === WizardMode.EDIT && beat.id 
    ? `/api/beats/${beat.id}` 
    : '/api/beats';
  const method = mode === WizardMode.EDIT ? 'PUT' : 'POST';

  console.log('🎵 submitSingleBeat: Making request to:', url, 'with method:', method);

  const response = await fetch(url, {
    method,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('🎵 submitSingleBeat: Error response:', error);
    throw new Error(error.message || 'Failed to save beat');
  }

  const result = await response.json();
  console.log('🎵 submitSingleBeat: Success response:', result);
  return result;
}

export async function submitBeatPack(pack: PackData, selectedBeats: BeatData[], mode: WizardMode) {
  console.log('🎵 submitBeatPack: Starting submission for pack:', pack);
  console.log('🎵 submitBeatPack: Selected beats:', selectedBeats);
  console.log('🎵 submitBeatPack: Mode:', mode);
  
  const formData = new FormData();
  
  // Add pack data
  formData.append('title', pack.title);
  formData.append('artist', pack.artist);
  formData.append('genre', pack.genre);
  formData.append('price', pack.price.toString());
  formData.append('description', pack.description);
  formData.append('published', pack.published.toString());
  formData.append('selectedBeats', JSON.stringify(Array.isArray(selectedBeats) ? selectedBeats.map(beat => beat.id) : []));
  
  console.log('🎵 submitBeatPack: Pack metadata added to FormData');
  
  // Add cover image
  if (pack.imageFile) {
    console.log('🎵 submitBeatPack: Adding pack image file:', pack.imageFile.name);
    formData.append('imageFile', pack.imageFile);
  }

  const url = mode === WizardMode.EDIT && pack.id 
    ? `/api/beat-packs/${pack.id}` 
    : '/api/beat-packs';
  const method = mode === WizardMode.EDIT ? 'PUT' : 'POST';

  console.log('🎵 submitBeatPack: Making request to:', url, 'with method:', method);

  const response = await fetch(url, {
    method,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('🎵 submitBeatPack: Error response:', error);
    throw new Error(error.message || 'Failed to save beat pack');
  }

  const result = await response.json();
  console.log('🎵 submitBeatPack: Success response:', result);
  return result;
}
