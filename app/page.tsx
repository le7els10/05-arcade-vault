export default function Home() {
  return (
    <main className="av-main">
      <section className="av-hero">
        <h1>ARCADE VAULT</h1>
        <p className="sub">
          INSERT COIN <span className="blink">▮</span>
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button className="btn lg pulse">JUGAR</button>
          <button className="btn lg magenta">SALÓN DE LA FAMA</button>
        </div>
      </section>
    </main>
  );
}
