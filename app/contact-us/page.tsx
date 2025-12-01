"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// --- 1. Validation Schema ---
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
    message: z.string().min(10, { message: "Message must be at least 10 characters." }),
})

export default function ContactUs() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    // --- 2. Form Hook ---
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    })

    // --- 3. Submit Handler ---
    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        // Simulate API call
        setTimeout(() => {
            console.log("Form Submitted:", values)
            setIsSubmitting(false)
            form.reset()
            alert("Message sent successfully! We'll get back to you soon.")
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* --- Left Column: Contact Information --- */}
                <div className="flex flex-col justify-center space-y-8 p-6 lg:p-12">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
                            Get in touch
                        </h1>
                        <p className="text-lg text-slate-600">
                            Have questions about your next trip? Need help with our AI planner?
                            Our team is here to help you build the perfect itinerary.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900">Headquarters</h3>
                                <p className="text-slate-600">Street No.1 Ali Park Lahore</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900">Email Us</h3>
                                <p className="text-slate-600">ahmadrao3226@gmail.com</p>
                                <p className="text-slate-600">ahsanabdullah2876@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Phone className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900">Call Support</h3>
                                <p className="text-slate-600">+92-3257369508</p>
                                <p className="text-slate-600">+92-3071500636</p>
                                <p className="text-sm text-slate-500">Mon-Fri from 8am to 5pm</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Contact Form --- */}
                <Card className="shadow-2xl border-0 ring-1 ring-slate-200">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Send us a message</CardTitle>
                        <CardDescription>
                            Fill out the form below and we'll get back to you within 24 hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your Full Name" {...field} className="bg-slate-50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="abc@example.com" {...field} className="bg-slate-50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Issue with billing..." {...field} className="bg-slate-50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us how we can help..."
                                                    className="min-h-[150px] bg-slate-50 resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}