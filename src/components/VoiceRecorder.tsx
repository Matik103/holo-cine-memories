import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onTranscription, disabled }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: "Speak now to search for movies..."
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice search.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    const transcriptionStartTime = Date.now();
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to Supabase edge function for transcription
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio }
        });

        const transcriptionDuration = Date.now() - transcriptionStartTime;

        if (error) {
          // Save analytics for failed transcription
          await saveVoiceAnalytics({
            query_text: '[TRANSCRIPTION_FAILED]',
            success: false,
            search_duration_ms: transcriptionDuration,
            error: error.message
          });
          throw error;
        }

        if (data.text && data.text.trim()) {
          const transcribedText = data.text.trim();
          
          // Save analytics for successful transcription
          await saveVoiceAnalytics({
            query_text: transcribedText,
            success: true,
            search_duration_ms: transcriptionDuration
          });
          
          onTranscription(transcribedText);
          toast({
            title: "Voice Captured!",
            description: `Transcribed: "${transcribedText}"`
          });
        } else {
          // Save analytics for no speech detected
          await saveVoiceAnalytics({
            query_text: '[NO_SPEECH_DETECTED]',
            success: false,
            search_duration_ms: transcriptionDuration
          });
          
          toast({
            title: "No Speech Detected",
            description: "Please try speaking more clearly.",
            variant: "destructive"
          });
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Save analytics for processing error
      await saveVoiceAnalytics({
        query_text: '[PROCESSING_ERROR]',
        success: false,
        search_duration_ms: Date.now() - transcriptionStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Transcription Failed",
        description: "Unable to process voice input. Please try typing instead.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveVoiceAnalytics = async (analyticsData: {
    query_text: string;
    success: boolean;
    search_duration_ms: number;
    error?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('user_query_analytics')
          .insert({
            user_id: user.id,
            query_text: analyticsData.query_text,
            query_type: 'voice',
            search_result: analyticsData.error ? { error: analyticsData.error } : null,
            success: analyticsData.success,
            search_duration_ms: analyticsData.search_duration_ms,
            user_agent: navigator.userAgent
          });
        
        if (error) {
          console.error('Error saving voice analytics:', error);
        } else {
          console.log('Voice analytics saved successfully');
        }
      }
    } catch (error) {
      console.error('Failed to save voice analytics:', error);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      className={`h-12 px-6 rounded-xl transition-all duration-200 ${
        isRecording 
          ? "border-red-500 bg-red-500/10 animate-pulse" 
          : "border-border hover:bg-secondary/50"
      }`}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      title={isRecording ? "Stop Recording" : "Start Voice Search"}
    >
      {isProcessing ? (
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : isRecording ? (
        <Square className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
      <span className="sr-only">
        {isRecording ? "Stop recording" : "Start voice recording"}
      </span>
    </Button>
  );
};