// reusable sort component
// optionsList: an array of sort options. e.g.format: [{ sort: 'likes', label: 'how it displays' }, ...]
// sort: current sort option
// disableAll: true/false flag
// onClick: a refernce to onClick function

const Comp = ({ optionsList, sort, disableAll, onClick }) => {
  return (
    <div>
      { optionsList.map(option => (
        <button key={ option.sort } onClick={ () => onClick(option.sort) } hidden={ option.sort.charAt(0) === '-' ? sort === option.sort : sort !== `-${ option.sort }` } disabled={ disableAll }>
          { option.label }
        </button>
      ))}
    </div>
  )
}

export default Comp