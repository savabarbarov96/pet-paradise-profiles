import React, { useState, useEffect } from 'react';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences,
  NotificationPreferences 
} from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_frequency: 'weekly',
    notify_new_stories: true,
    notify_comments: true,
    notify_system_updates: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        const result = await getNotificationPreferences();
        if (result.success && result.data) {
          setPreferences(result.data);
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        toast.error("Failed to load notification settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleFrequencyChange = (value: 'daily' | 'weekly' | 'never') => {
    setPreferences(prev => ({ ...prev, email_frequency: value }));
  };

  const handleToggleChange = (field: keyof NotificationPreferences) => {
    setPreferences(prev => ({ 
      ...prev, 
      [field]: !prev[field as keyof typeof prev] 
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await updateNotificationPreferences(preferences);
      if (result.success) {
        toast.success("Notification settings updated");
      } else {
        toast.error("Failed to update settings", { 
          description: result.error || "Please try again"
        });
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-paradise" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-paradise mb-4">Email Notification Settings</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Email Frequency</h4>
          <RadioGroup 
            value={preferences.email_frequency} 
            onValueChange={(v) => handleFrequencyChange(v as 'daily' | 'weekly' | 'never')}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily updates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly digest</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="never" id="never" />
              <Label htmlFor="never">Don't send emails</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-medium mb-1">Notification Types</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyStories" className="text-sm">
              New stories and tributes
            </Label>
            <Switch 
              id="notifyStories" 
              checked={preferences.notify_new_stories}
              onCheckedChange={() => handleToggleChange('notify_new_stories')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyComments" className="text-sm">
              Comments on your pet's profile
            </Label>
            <Switch 
              id="notifyComments" 
              checked={preferences.notify_comments}
              onCheckedChange={() => handleToggleChange('notify_comments')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyUpdates" className="text-sm">
              System updates and new features
            </Label>
            <Switch 
              id="notifyUpdates" 
              checked={preferences.notify_system_updates}
              onCheckedChange={() => handleToggleChange('notify_system_updates')}
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        className="w-full mt-6"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  );
};

export default NotificationSettings; 