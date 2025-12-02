'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, FileText, Briefcase, MessageSquare, User } from 'lucide-react';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';

interface InterviewItem {
  id: string;
  title: string;
  company: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  interviewType: string;
  notes?: string;
  tailoredResume?: string;
  jobListing?: string;
}

// Mock data - replace with actual data fetching
const mockInterviews: InterviewItem[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    date: '2025-01-15',
    status: 'upcoming',
    interviewType: 'Technical Interview',
    notes: 'Focus on system design and algorithms',
    tailoredResume: 'Resume tailored for this position...',
    jobListing: 'Job listing details...',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    date: '2025-01-10',
    status: 'completed',
    interviewType: 'Behavioral Interview',
    notes: 'Went well, waiting for feedback',
    tailoredResume: 'Resume tailored for this position...',
    jobListing: 'Job listing details...',
  },
];

export default function InterviewPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/50';
      case 'completed':
        return 'text-green-400 bg-green-400/20 border-green-400/50';
      case 'cancelled':
        return 'text-red-400 bg-red-400/20 border-red-400/50';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Interview Preparation</h1>
        <p className="text-gray-400">Manage your interview materials, tailored resumes, and job listings</p>
      </div>

      <Tabs defaultValue="interviews" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-700">
          <TabsTrigger value="interviews" className="data-[state=active]:bg-gray-800">
            <MessageSquare className={cn(getIconSize('sm'), "mr-2")} />
            Interviews
          </TabsTrigger>
          <TabsTrigger value="resumes" className="data-[state=active]:bg-gray-800">
            <FileText className={cn(getIconSize('sm'), "mr-2")} />
            Tailored Resumes
          </TabsTrigger>
          <TabsTrigger value="listings" className="data-[state=active]:bg-gray-800">
            <Briefcase className={cn(getIconSize('sm'), "mr-2")} />
            Job Listings
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-gray-800">
            <User className={cn(getIconSize('sm'), "mr-2")} />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="mt-6">
          <div className="space-y-4">
            {mockInterviews.map((interview) => (
              <Collapsible
                key={interview.id}
                open={openItems[interview.id] || false}
                onOpenChange={() => toggleItem(interview.id)}
              >
                <Card className="bg-gray-900 border-gray-700">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-white">{interview.title}</CardTitle>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium border",
                              getStatusColor(interview.status)
                            )}>
                              {interview.status}
                            </span>
                          </div>
                          <CardDescription className="text-gray-400">
                            {interview.company} • {interview.interviewType} • {new Date(interview.date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 text-gray-400 transition-transform",
                            openItems[interview.id] && "transform rotate-180"
                          )}
                        />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {interview.notes && (
                        <div>
                          <h4 className="text-white font-semibold mb-2">Notes</h4>
                          <p className="text-gray-300 text-sm">{interview.notes}</p>
                        </div>
                      )}
                      {interview.tailoredResume && (
                        <div>
                          <h4 className="text-white font-semibold mb-2">Tailored Resume</h4>
                          <p className="text-gray-300 text-sm">{interview.tailoredResume}</p>
                        </div>
                      )}
                      {interview.jobListing && (
                        <div>
                          <h4 className="text-white font-semibold mb-2">Job Listing</h4>
                          <p className="text-gray-300 text-sm">{interview.jobListing}</p>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </TabsContent>

        {/* Tailored Resumes Tab */}
        <TabsContent value="resumes" className="mt-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Tailored Resumes</CardTitle>
              <CardDescription className="text-gray-400">
                Resumes customized for specific job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Resume content will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Listings Tab */}
        <TabsContent value="listings" className="mt-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Job Listings</CardTitle>
              <CardDescription className="text-gray-400">
                Track job opportunities you're interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Job listings will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Profile</CardTitle>
              <CardDescription className="text-gray-400">
                Your interview preparation profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Profile information will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

