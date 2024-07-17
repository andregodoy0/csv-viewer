import Table from "./components/Table";

const HomePage = () => {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="container mx-16 flex flex-col justify-center gap-12 px-16 py-16">
        <div className="flex w-full flex-auto flex-col items-center justify-center gap-2">
          <h1 className="text-3xl font-bold">
            Select any valid .CSV file to preview
          </h1>
          <Table />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
