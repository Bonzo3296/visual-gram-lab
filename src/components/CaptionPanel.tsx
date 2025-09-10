import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useProjectStore } from "@/store/useProjectStore";
import { Hash, AtSign, AlertTriangle } from "lucide-react";

export function CaptionPanel() {
  const { currentProject, updateCaption, updateCaptionClampMode } = useProjectStore();

  if (!currentProject) {
    return null;
  }

  const { text, clampMode } = currentProject.caption;
  const charCount = text.length;
  const maxChars = 2200;
  
  // Count hashtags and mentions
  const hashtagCount = (text.match(/#\w+/g) || []).length;
  const mentionCount = (text.match(/@\w+/g) || []).length;
  
  const getProgressColor = () => {
    if (charCount > maxChars) return "bg-destructive";
    if (charCount > 2000) return "bg-yellow-500";
    return "bg-ig-primary";
  };

  const getProgressValue = () => {
    return Math.min((charCount / maxChars) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-ig-text-primary font-instagram flex items-center justify-between">
          Caption
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs font-instagram">
              {charCount}/{maxChars}
            </Badge>
            {charCount > 2000 && (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Scrivi la tua caption qui... Usa #hashtag e @menzioni per renderla più coinvolgente!"
            value={text}
            onChange={(e) => updateCaption(e.target.value)}
            className="min-h-[120px] resize-none font-instagram text-sm border-ig-border focus:border-ig-primary"
            disabled={charCount >= maxChars}
          />
          
          <div className="space-y-2">
            <Progress 
              value={getProgressValue()} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs font-instagram">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-ig-text-secondary">
                  <Hash className="h-3 w-3" />
                  <span>{hashtagCount}</span>
                  {hashtagCount > 30 && (
                    <span className="text-yellow-600">(max 30 consigliati)</span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-ig-text-secondary">
                  <AtSign className="h-3 w-3" />
                  <span>{mentionCount}</span>
                </div>
              </div>
              
              <span className={`
                ${charCount > maxChars ? 'text-destructive' : ''}
                ${charCount > 2000 && charCount <= maxChars ? 'text-yellow-600' : ''}
                ${charCount <= 2000 ? 'text-ig-text-secondary' : ''}
              `}>
                {charCount > maxChars && 'Limite superato'}
                {charCount > 2000 && charCount <= maxChars && 'Quasi al limite'}
                {charCount <= 2000 && 'Caratteri rimanenti'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-ig-text-primary font-instagram">
            Modalità anteprima nel feed
          </Label>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="clamp-mode"
                checked={clampMode === '2lines'}
                onCheckedChange={(checked) => 
                  updateCaptionClampMode(checked ? '2lines' : '125chars')
                }
              />
              <Label 
                htmlFor="clamp-mode" 
                className="text-sm font-instagram text-ig-text-secondary"
              >
                {clampMode === '2lines' ? '2 righe' : '~125 caratteri'}
              </Label>
            </div>
            
            <Badge variant="secondary" className="text-xs font-instagram">
              {clampMode === '2lines' ? 'Moderno' : 'Classico'}
            </Badge>
          </div>
          
          <p className="text-xs text-ig-text-tertiary font-instagram">
            {clampMode === '2lines' 
              ? 'Mostra le prime 2 righe del testo con "... altro"'
              : 'Tronca dopo circa 125 caratteri (modalità storica Instagram)'
            }
          </p>
        </div>

        {/* Preview of formatted text */}
        {text && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-ig-text-primary font-instagram">
              Anteprima formattazione
            </Label>
            <div className="p-3 bg-muted/30 rounded-lg border border-ig-border text-sm font-instagram">
              <div
                dangerouslySetInnerHTML={{
                  __html: text
                    .replace(/\n/g, '<br>')
                    .replace(/#(\w+)/g, '<span class="text-ig-primary font-medium">#$1</span>')
                    .replace(/@(\w+)/g, '<span class="text-ig-primary font-medium">@$1</span>')
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}