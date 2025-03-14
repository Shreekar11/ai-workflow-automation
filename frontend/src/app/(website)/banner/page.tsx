import { Safari } from "@/components/ui/safari";

const SafariDemo = () => {
  return (
    <div className="h-screen w-screen bg-[url('/assets/macOSBigSur.jpg')] bg-cover bg-center flex justify-center items-center">
      <Safari
        url="https://workflows-flax.vercel.app/"
        className="py-20"
        imageSrc={`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_BUCKET_NAME}/532c6f10-a642-4828-8f58-39790af43925.png`}
      />
    </div>
  );
};

export default SafariDemo;
