import ComboGrid from '../components/ComboGrid';

export default function Page(){
  return (
    <div>
      <section style={{marginTop:12, padding:16, background:'#fff', borderRadius:12}}>
        <h1>Combo del momento (Cuballama)</h1>
        <p style={{color:'#666', fontSize:14}}>
          Dati aggiornati periodicamente dalla pagina pubblica di Iré a Santiago (Cuballama).
        </p>
      </section>
      <ComboGrid />
    </div>
  );
}