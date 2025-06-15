import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Linkedin, Github, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './ui/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      setFormData({ name: '', email: '', message: '' });

    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem sending your message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-16 sm:py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-neon-yellow mb-12 sm:mb-16 animate-fade-in-up">
          Get In Touch
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6 sm:space-y-8">
            <div className="animate-fade-in-up">
              <h3 className="text-xl sm:text-2xl font-bold text-neon-green mb-4 sm:mb-6">Let's Connect</h3>
              <p className="text-neon-pink text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                I'm always open to discussing new opportunities, collaborations, or just having a chat about technology and innovation. Feel free to reach out!
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card className="bg-cyber-dark border-neon-purple hover:border-neon-green transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Mail className="text-neon-yellow w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-neon-green font-semibold text-sm sm:text-base">Email</h4>
                      <p className="text-neon-pink text-sm sm:text-base break-all">ishmam.solaiman@gmail.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cyber-dark border-neon-purple hover:border-neon-green transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Linkedin className="text-neon-yellow w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-neon-green font-semibold text-sm sm:text-base">LinkedIn</h4>
                      <a 
                        href="https://linkedin.com/in/ishmam-solaiman" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-pink hover:text-neon-yellow transition-colors text-sm sm:text-base break-all"
                      >
                        linkedin.com/in/ishmam-solaiman
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cyber-dark border-neon-purple hover:border-neon-green transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Github className="text-neon-yellow w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-neon-green font-semibold text-sm sm:text-base">GitHub</h4>
                      <a 
                        href="https://github.com/Ishmam97" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-pink hover:text-neon-yellow transition-colors text-sm sm:text-base break-all"
                      >
                        github.com/Ishmam97
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-cyber-dark border-neon-purple animate-fade-in-up">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-neon-green flex items-center text-lg sm:text-xl">
                <MessageSquare className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
                Send a Message
              </CardTitle>
              <CardDescription className="text-neon-pink text-sm sm:text-base">
                Fill out the form below and I'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <Input
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-cyber-darker border-neon-purple text-neon-green placeholder:text-neon-pink/50 focus:border-neon-yellow text-sm sm:text-base h-10 sm:h-12"
                  />
                </div>
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-cyber-darker border-neon-purple text-neon-green placeholder:text-neon-pink/50 focus:border-neon-yellow text-sm sm:text-base h-10 sm:h-12"
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="bg-cyber-darker border-neon-purple text-neon-green placeholder:text-neon-pink/50 focus:border-neon-yellow resize-none text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neon-yellow text-cyber-dark hover:bg-neon-green transition-colors font-semibold text-sm sm:text-base h-10 sm:h-12"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 w-4 h-4" />
                  )}
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
