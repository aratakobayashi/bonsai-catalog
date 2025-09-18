require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function getProductImages() {
  const productIds = ['b5f56831-a2e9-40b9-9d68-0e3ededab59c', 'e454fc48-b997-4e83-9341-1e8e9d487a07', '9858bd55-6d3e-406b-a3be-5db66fd23d38', '749eb317-640a-486d-8ce2-272a83393ce3', 'cebb1be6-436b-44e4-b130-c35cc626bf58']

  const { data, error } = await supabase
    .from('products')
    .select('id, name, image_url')
    .in('id', productIds)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Products:')
    data.forEach(product => {
      console.log(`ID: ${product.id}`)
      console.log(`Name: ${product.name}`)
      console.log(`Image URL: ${product.image_url}`)
      console.log('---')
    })
  }
}

getProductImages()