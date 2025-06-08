"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { useState } from "react";

const feedbackFormSchema = z.object({
  feedbackText: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }).max(1000, {
    message: "Feedback must be at most 1000 characters."
  }),
});

export default function FeedbackForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      feedbackText: "",
    },
  });

  async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Feedback submitted:", values.feedbackText);
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for helping us improve EcoAssess.",
      variant: "default",
    });
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <MessageSquarePlus className="h-6 w-6 text-primary" />
          Share Your Feedback
        </CardTitle>
        <CardDescription>
          Help us improve EcoAssess by sharing your thoughts or suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="feedbackText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you think..."
                      className="min-h-[100px] resize-y"
                      {...field}
                      aria-label="Feedback input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting} aria-label="Submit Feedback Button">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
