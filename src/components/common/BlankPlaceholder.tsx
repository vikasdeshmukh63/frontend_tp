import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function PagePlaceholder({ title }: { title: string }) {
  return (
    <div>
      <PageBreadcrumb pageTitle={title} />
      <div className="min-h-[40vh] rounded-2xl border border-gray-200 bg-white px-5 py-12 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-16">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Content coming soon.
        </p>
      </div>
    </div>
  );
}
