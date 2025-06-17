
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

const Blog = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
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
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } else {
      setPosts(data || []);
    }
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

          {/* Blog Posts */}
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
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-64 object-contain rounded-lg mb-4 bg-cyber-dark cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setEnlargedImage(post.image_url)}
                    />
                  )}
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
