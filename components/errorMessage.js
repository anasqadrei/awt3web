export default ({ message }) => (
  <aside>
    { message || 'حدث خطأ ما. الرجاء إعادة المحاولة.' }
    <style jsx>{`
      aside {
        padding: 1.5em;
        font-size: 14px;
        color: white;
        background-color: red;
      }
    `}</style>
  </aside>
)
