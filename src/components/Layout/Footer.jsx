export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-5 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Made by Drew Kalafatas for{' '}
        <span className="text-branson-blue font-medium">Branson School</span>
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
        Questions or feedback?{' '}
        <a
          href="mailto:andrew_kalafatas@branson.org"
          className="text-branson-green hover:underline"
        >
          andrew_kalafatas@branson.org
        </a>
      </p>
    </footer>
  );
}
