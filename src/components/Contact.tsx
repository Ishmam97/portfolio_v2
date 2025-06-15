
import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Linkedin, Github } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-neon-yellow mb-16 animate-fade-in-up">
          Get In Touch
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="animate-fade-in-up">
              <h3 className="text-2xl font-bold text-neon-green mb-6">Let's Connect</h3>
              <p className="text-neon-pink text-lg leading-relaxed mb-8">
                I'm always open to discussing new opportunities, collaborations, or just having a chat about technology and innovation. Feel free to reach out!
              </p>
            </div>

            <div className="space-y-6">
              <Card className="bg-cyber-dark border-neon-purple hover:border-neon-green transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Mail className="text-neon-yellow w-6 h-6" />
                    <div>
                      <h4 className="text-neon-green font-semibold">Email</h4>
                      <p className="text-neon-pink">ishmam.solaiman@gmail.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cyber-dark border-neon-purple hover:border-neon-green transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Linkedin className="text-neon-yellow w-6 h-6" />
                    <div>
                      <h4 className="text-neon-green font-semibold">LinkedIn</h4>
                      <a 
                        href="https://linkedin.com/in/ishmam-solaiman" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-pink hover:text-neon-yellow transition-colors"
                      >
                        linkedin.com/in/ishmam-solaiman
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cyber-dark border-neon-purple hover:border-neon-green transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Github className="text-neon-yellow w-6 h-6" />
                    <div>
                      <h4 className="text-neon-green font-semibold">GitHub</h4>
                      <a 
                        href="https://github.com/Ishmam97" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-pink hover:text-neon-yellow transition-colors"
                      >
                        github.com/Ishmam97
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="bg-cyber-dark border-neon-purple animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center">
                <MessageSquare className="mr-2" />
                Send a Message
              </CardTitle>
              <CardDescription className="text-neon-pink">
                Fill out the form below and I'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-cyber-darker border-neon-purple text-neon-green placeholder:text-neon-pink/50 focus:border-neon-yellow"
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
                    className="bg-cyber-darker border-neon-purple text-neon-green placeholder:text-neon-pink/50 focus:border-neon-yellow"
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="bg-cyber-darker border-neon-purple text-neon-green placeholder:text-neon-pink/50 focus:border-neon-yellow resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-neon-yellow text-cyber-dark hover:bg-neon-green transition-colors font-semibold"
                >
                  <Send className="mr-2 w-4 h-4" />
                  Send Message
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
