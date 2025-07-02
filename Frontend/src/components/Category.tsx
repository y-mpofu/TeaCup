type CategoryProps = {
  title: string
  imageUrl?: string
  description?: string
}

export default function Category({ title, imageUrl, description }: CategoryProps) {
  return (
    <div className="card" style={{ backgroundColor: '#333' }}>
      <h3>{title}</h3>
      <p>{description || 'Curated feed'}</p>
    </div>
  )
}
