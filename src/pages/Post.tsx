import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Post = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Post form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: credentials, error } = await supabase
        .from('admin_credentials')
        .select('email, password_hash')
        .eq('email', email)
        .single();

      if (error || !credentials) {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return;
      }

      // Check password using SQL function
      const { data: isValid, error: authError } = await supabase
        .rpc('verify_password', {
          email: email,
          password: password
        }) as { data: boolean | null; error: any };

      if (authError || !isValid) {
        toast({
          title: "Authentication Failed", 
          description: "Invalid email or password",
          variant: "destructive"
        });
        return;
      }

      setIsAuthenticated(true);
      toast({
        title: "Authentication Successful",
        description: "You can now create blog posts"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Authentication failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title,
          body,
          media_url: mediaUrl || null,
          media_type: mediaUrl ? mediaType : null,
          author_id: '00000000-0000-0000-0000-000000000000' // Admin user
        });

      if (error) throw error;

      toast({
        title: "Post Created",
        description: "Your blog post has been created successfully"
      });

      // Reset form
      setTitle('');
      setBody('');
      setMediaUrl('');
      setMediaType('image');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedia = () => {
    if (!mediaUrl) return null;

    if (mediaType === 'video') {
      // Check if it's a YouTube URL
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const youtubeMatch = mediaUrl.match(youtubeRegex);
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return (
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-md"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      } else {
        return (
          <video className="w-full rounded-md" controls>
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      }
    } else {
      return <img src={mediaUrl} alt="Preview" className="w-full rounded-md" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Admin Login</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Create Blog Post</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mediaUrl">Media URL (optional)</Label>
                  <Input
                    id="mediaUrl"
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg or https://youtube.com/watch?v=..."
                  />
                </div>

                {mediaUrl && (
                  <div className="space-y-2">
                    <Label>Media Type</Label>
                    <Select value={mediaType} onValueChange={(value: 'image' | 'video') => setMediaType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="body">Body</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Post..." : "Create Post"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {title && (
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
              )}
              
              {mediaUrl && (
                <div className="mb-4">
                  {renderMedia()}
                </div>
              )}

              {body && (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{body}</p>
                </div>
              )}

              {!title && !body && !mediaUrl && (
                <p className="text-muted-foreground">
                  Fill out the form to see a preview of your post
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Post;