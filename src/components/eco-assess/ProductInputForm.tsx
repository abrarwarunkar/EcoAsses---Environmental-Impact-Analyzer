
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ImagePlus, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  productDescription: z.string().min(20, {
    message: "Product description must be at least 20 characters.",
  }).max(2000, {
    message: "Product description must be at most 2000 characters.",
  }),
  productImage: z
    .custom<FileList>((val) => val instanceof FileList, "Please upload a file")
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

type ProductInputFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
};

export default function ProductInputForm({ onSubmit, isLoading }: ProductInputFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productDescription: "",
      productImage: undefined,
    },
  });

  const watchImage = form.watch("productImage");

  useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      const file = watchImage[0];
      if (ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  }, [watchImage]);

  const handleRemoveImage = () => {
    form.setValue("productImage", undefined);
    setImagePreview(null);
    const fileInput = document.getElementById('productImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Analyze Product Impact</CardTitle>
        <CardDescription>
          Enter a product description, URL, or key details. Optionally, upload an image for a more comprehensive analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Organic cotton t-shirt, made in Vietnam, shipped by sea."
                      className="min-h-[120px] resize-y"
                      {...field}
                      aria-label="Product Description Input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productImage"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Product Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        id="productImage"
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={(e) => onChange(e.target.files)}
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        aria-label="Product Image Upload"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {imagePreview && (
              <div className="mt-4 relative group">
                <Image 
                  src={imagePreview} 
                  alt="Product preview" 
                  width={200} 
                  height={200} 
                  className="rounded-md object-contain max-h-48 w-auto border" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}


            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading} aria-label="Analyze Product Button">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Product"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
