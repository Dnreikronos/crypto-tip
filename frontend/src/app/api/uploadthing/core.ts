import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server";
// import { cookies } from "next/headers";

const f = createUploadthing();

// Função de autenticação simplificada (temporariamente desabilitada)
// const auth = async () => {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;
//
//   if (!token) {
//     return null;
//   }

//   // Por enquanto, se tem token, considera autenticado
//   // TODO: Implementar verificação real com o backend se necessário
//   return { id: "user" };
// };

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      console.log("Upload middleware called");

      // Temporariamente removendo autenticação para testar
      // const user = await auth();
      // if (!user) throw new UploadThingError("Unauthorized - Please login first");

      return { userId: "test-user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
