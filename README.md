

## Getting Started
#First install the package needed:
```bash
npm install
# or 
yarn add all
# or 
pnpm install
# or
bun add all
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

##Technologies used:
 - Nextjs 14.0.1
 - Prisma (interact with database)
 - Database used: planetscale - mysql database
 - clsx and tailwindmerge: for better className handling in next and react
 - File upload: uploadthing hosting
 - langchain and pinecone: vectorize text to provide answer with AI
 - openai: realtime chat with AI
 - React toast: better UI notification
 - shadcn & lucide : UI Libraries with premade components for better look
 - react-pdf, pdf parse : render and read text from pdf
 - stripe: secure portal for purcharses
 - zod: type safety


 ## Usage:
 - As an user, you will be able to upload your own pdf file and chat with AI about the content.
 - Effective for learning, specially when lost of skim & scan needed.
 - If you are not a fan of AI, this can act as an pdf uploader to keep your pdf safe and secure.

 ## Online:
 ```
 https://quill-sooty-zeta.vercel.app/dashboard
 ```

 Currently having problem with database connecting to Vercel. Any questions or query please leave message 
 (Also if you want to try it out currently)