import invariant from "tiny-invariant";
import { redirect, json } from "@remix-run/node";
import { useActionData, useTransition } from "@remix-run/react";

import type { Post } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";

import { createPost } from "~/models/post.server";
import PostForm from "~/components/PostForm";

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

  const title = form.get("title");
  const slug = form.get("slug");
  const markdown = form.get("markdown");

  const errors = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  await createPost({ title, markdown, slug } as Pick<
    Post,
    "slug" | "markdown" | "title"
  >);
  return redirect("/posts/admin");
};

export default function NewPost() {
  const errors = useActionData<typeof action>();
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return <PostForm errors={errors} isCreating={isCreating} />;
}
