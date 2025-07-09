import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { Plus, MessageCircle, Calendar, User as UserIcon, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Navigation from '@/components/Navigation';

interface BlogPost {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  content: string;
  visitor_name: string;
  visitor_email?: string;
  visitor_phone?: string;
  created_at: string;
}

interface CommentForm {
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  content: string;
}

// Loading Animation Component
const BlogLoadingAnimation = () => {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((index) => (
        <div key={index} className="relative">
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[rgb(0,255,156)] via-[rgb(255,64,129)] to-[rgb(223,255,61)] p-[2px] animate-pulse">
            <div className="bg-cyber-darker rounded-lg h-full w-full"></div>
          </div>
          
          {/* Card Content */}
          <Card className="relative bg-cyber-darker border-0 overflow-hidden">
            {/* Scanning Line Animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgb(0,255,156)] to-transparent animate-scan"></div>
            
            <CardHeader className="space-y-4">
              {/* Title Skeleton */}
              <div className="space-y-2">
                <div className="h-8 bg-gradient-to-r from-[rgb(0,255,156)]/20 to-[rgb(223,255,61)]/20 rounded animate-pulse-neon"></div>
                <div className="h-4 bg-gradient-to-r from-[rgb(255,64,129)]/20 to-[rgb(0,255,156)]/20 rounded w-2/3 animate-pulse-neon-delayed"></div>
              </div>
              
              {/* Meta Info Skeleton */}
              <div className="flex gap-4">
                <div className="h-4 bg-[rgb(255,64,129)]/30 rounded w-24 animate-pulse-slow"></div>
                <div className="h-4 bg-[rgb(255,64,129)]/30 rounded w-16 animate-pulse-slow"></div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Image Skeleton */}
              <div className="relative h-64 bg-gradient-to-br from-[rgb(0,255,156)]/10 via-[rgb(255,64,129)]/10 to-[rgb(223,255,61)]/10 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="space-y-3">
                {[1, 2, 3, 4].map((line) => (
                  <div 
                    key={line}
                    className="h-4 bg-gradient-to-r from-[rgb(0,255,156)]/20 to-transparent rounded animate-pulse-neon"
                    style={{ 
                      width: line === 4 ? '60%' : '100%',
                      animationDelay: `${line * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
              
              {/* Comments Button Skeleton */}
              <div className="pt-4 border-t border-[rgb(255,64,129)]/30">
                <div className="h-10 bg-gradient-to-r from-[rgb(255,64,129)]/20 to-[rgb(0,255,156)]/20 rounded w-32 animate-pulse-neon"></div>
              </div>
            </CardContent>
            
            {/* Data Stream Effect */}
            <div className="absolute right-4 top-4 flex flex-col space-y-1 opacity-30">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div 
                  key={dot}
                  className="w-2 h-2 rounded-full bg-[rgb(0,255,156)] animate-data-stream"
                  style={{ animationDelay: `${dot * 0.2}s` }}
                ></div>
              ))}
            </div>
          </Card>
        </div>
      ))}
      
      {/* Central Loading Indicator */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-16 h-16 border-4 border-[rgb(0,255,156)]/20 rounded-full animate-spin-slow"></div>
          {/* Inner Ring */}
          <div className="absolute top-2 left-2 w-12 h-12 border-4 border-t-[rgb(255,64,129)] border-r-[rgb(223,255,61)] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[rgb(223,255,61)] rounded-full animate-pulse-fast"></div>
        </div>
        <div className="mt-4 text-[rgb(0,255,156)] font-mono animate-pulse-text">
          Loading blog posts...
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-neon {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes pulse-neon-delayed {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes pulse-text {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes data-stream {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-pulse-neon {
          animation: pulse-neon 2s ease-in-out infinite;
        }
        
        .animate-pulse-neon-delayed {
          animation: pulse-neon-delayed 2.5s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }
        
        .animate-pulse-text {
          animation: pulse-text 1.5s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-data-stream {
          animation: data-stream 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const Blog = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', image_url: '' });
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentForms, setCommentForms] = useState<Record<string, CommentForm>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const isAuthor = user?.id === 'your-author-id'; // You'll need to replace this with your actual user ID

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    fetchPosts();

    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // Add a minimum loading time for better UX
    const [postsResult] = await Promise.all([
      supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false }),
      new Promise(resolve => setTimeout(resolve, 1500)) // Minimum 1.5s loading
    ]);

    const { data, error } = postsResult;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } else {
      setPosts((data || []) as BlogPost[]);
    }
    setLoading(false);
  };

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    }
  };

  const createPost = async () => {
    if (!user || !newPost.title.trim() || !newPost.body.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('blog_posts')
      .insert([{
        title: newPost.title,
        body: newPost.body,
        image_url: newPost.image_url || null,
        author_id: user.id
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Blog post created successfully"
      });
      setNewPost({ title: '', body: '', image_url: '' });
      setShowCreateForm(false);
      fetchPosts();
    }
  };

  const addComment = async (postId: string) => {
    const form = commentForms[postId];
    
    if (!form || !form.visitor_name.trim() || !form.content.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name and a comment",
        variant: "destructive"
      });
      return;
    }

    if (!form.visitor_email.trim() && !form.visitor_phone.trim()) {
      toast({
        title: "Error",
        description: "Please provide either an email address or phone number",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('blog_comments')
      .insert([{
        post_id: postId,
        visitor_name: form.visitor_name,
        visitor_email: form.visitor_email || null,
        visitor_phone: form.visitor_phone || null,
        content: form.content
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Comment posted successfully"
      });
      setCommentForms(prev => ({
        ...prev,
        [postId]: { visitor_name: '', visitor_email: '', visitor_phone: '', content: '' }
      }));
      fetchComments(postId);
    }
  };

  const updateCommentForm = (postId: string, field: keyof CommentForm, value: string) => {
    setCommentForms(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId] || { visitor_name: '', visitor_email: '', visitor_phone: '', content: '' },
        [field]: value
      }
    }));
  };

  const toggleComments = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        await fetchComments(postId);
      }
      // Initialize comment form for this post if it doesn't exist
      if (!commentForms[postId]) {
        setCommentForms(prev => ({
          ...prev,
          [postId]: { visitor_name: '', visitor_email: '', visitor_phone: '', content: '' }
        }));
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMedia = (post: BlogPost) => {
    // Priority: media_url/media_type over legacy image_url
    const mediaUrl = post.media_url || post.image_url;
    const mediaType = post.media_type || 'image';

    if (!mediaUrl) return null;

    if (mediaType === 'video') {
      // Check if it's a YouTube URL
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const youtubeMatch = mediaUrl.match(youtubeRegex);
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return (
          <div className="aspect-video mb-4">
            <iframe
              className="w-full h-full rounded-lg"
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
          <video 
            className="w-full rounded-lg mb-4 bg-cyber-dark" 
            controls
            style={{ maxHeight: '400px' }}
          >
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      }
    } else {
      return (
        <img
          src={mediaUrl}
          alt={post.title}
          className="w-full h-64 object-contain rounded-lg mb-4 bg-cyber-dark cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setEnlargedImage(mediaUrl)}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Navbar />
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" style={{ marginTop: '30px' }} data-lov-id="src/pages/Blog.tsx:184:12">
            <h1 className="text-4xl sm:text-5xl font-bold text-neon-yellow mb-4 neon-glow font-creattion group transition-all duration-300 hover:text-neon-yellow hover:navbar-flicker">
              Bits and Bytes
            </h1>
            <p className="text-neon-green text-lg">
              Thoughts, insights, and updates from my journey
            </p>
          </div>

          {/* Create Post Button (only for author) */}
          {user && isAuthor && (
            <div className="mb-8">
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-neon-purple hover:bg-neon-purple/80 text-white border-2 border-neon-purple"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Post
              </Button>
            </div>
          )}

          {/* Create Post Form */}
          {showCreateForm && (
            <Card className="mb-8 bg-cyber-darker border-2 border-neon-purple">
              <CardHeader>
                <CardTitle className="text-neon-yellow">Create New Blog Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-cyber-dark border-neon-green text-neon-green"
                />
                <Input
                  placeholder="Image URL (optional)"
                  value={newPost.image_url}
                  onChange={(e) => setNewPost(prev => ({ ...prev, image_url: e.target.value }))}
                  className="bg-cyber-dark border-neon-green text-neon-green"
                />
                <Textarea
                  placeholder="Write your post content..."
                  value={newPost.body}
                  onChange={(e) => setNewPost(prev => ({ ...prev, body: e.target.value }))}
                  className="min-h-32 bg-cyber-dark border-neon-green text-neon-green"
                />
                <div className="flex gap-2">
                  <Button onClick={createPost} className="bg-neon-green hover:bg-neon-green/80 text-cyber-dark">
                    Publish Post
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink/20"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blog Posts with Loading Animation */}
          {loading ? (
            <BlogLoadingAnimation />
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <Card key={post.id} className="bg-cyber-darker border-2 border-neon-purple">
                  <CardHeader>
                    <CardTitle className="text-neon-yellow text-2xl">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-neon-pink text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        Author
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderMedia(post)}
                    <div className="text-neon-green whitespace-pre-wrap mb-4">
                      {post.body}
                    </div>
                    
                    {/* Comments Section */}
                    <div className="border-t border-neon-purple pt-4">
                      <Button
                        variant="outline"
                        onClick={() => toggleComments(post.id)}
                        className="border-neon-pink text-neon-pink hover:bg-neon-pink/20 mb-4"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {expandedPost === post.id ? 'Hide' : 'Show'} Comments
                        {comments[post.id] && ` (${comments[post.id].length})`}
                      </Button>

                      {expandedPost === post.id && (
                        <div className="space-y-4">
                          {/* Comments List */}
                          <div className="space-y-3">
                            {comments[post.id]?.map((comment) => (
                              <div key={comment.id} className="bg-cyber-dark rounded-lg p-3 border border-neon-purple">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-neon-yellow font-medium">
                                    {comment.visitor_name}
                                  </div>
                                  <div className="text-neon-green text-sm">
                                    {formatDate(comment.created_at)}
                                  </div>
                                </div>
                                <div className="text-neon-pink">
                                  {comment.content}
                                </div>
                              </div>
                            ))}
                          </div>

                          {comments[post.id]?.length === 0 && (
                            <p className="text-neon-pink text-sm italic text-center py-4">
                              No comments yet. Be the first to comment!
                            </p>
                          )}
                          {/* Add Comment Form */}
                          <div className="bg-cyber-dark rounded-lg p-4 border border-neon-purple">
                            <h4 className="text-neon-yellow mb-3">Leave a Comment</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <Input
                                placeholder="First and Last Name *"
                                value={commentForms[post.id]?.visitor_name || ''}
                                onChange={(e) => updateCommentForm(post.id, 'visitor_name', e.target.value)}
                                className="bg-cyber-darker border-neon-green text-neon-green"
                              />
                              <Input
                                placeholder="Email Address"
                                type="email"
                                value={commentForms[post.id]?.visitor_email || ''}
                                onChange={(e) => updateCommentForm(post.id, 'visitor_email', e.target.value)}
                                className="bg-cyber-darker border-neon-green text-neon-green"
                              />
                            </div>
                            <Input
                              placeholder="Phone Number"
                              value={commentForms[post.id]?.visitor_phone || ''}
                              onChange={(e) => updateCommentForm(post.id, 'visitor_phone', e.target.value)}
                              className="bg-cyber-darker border-neon-green text-neon-green mb-3"
                            />
                            <Textarea
                              placeholder="Write your comment..."
                              value={commentForms[post.id]?.content || ''}
                              onChange={(e) => updateCommentForm(post.id, 'content', e.target.value)}
                              className="bg-cyber-darker border-neon-green text-neon-green mb-3"
                              rows={3}
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-neon-pink italic">
                                * Required. Either email or phone required. Only your name will be displayed.
                              </p>
                              <Button
                                onClick={() => addComment(post.id)}
                                className="bg-neon-green hover:bg-neon-green/80 text-cyber-dark"
                              >
                                Post Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {posts.length === 0 && (
                <Card className="bg-cyber-darker border-2 border-neon-purple">
                  <CardContent className="text-center py-12">
                    <p className="text-neon-pink text-lg">No blog posts yet. Check back soon!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <Button
              variant="outline"
              size="icon"
              className="absolute -top-12 right-0 bg-cyber-dark border-neon-pink text-neon-pink hover:bg-neon-pink/20"
              onClick={() => setEnlargedImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={enlargedImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;