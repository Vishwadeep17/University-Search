import * as React from 'react';
import Box from '@mui/material/Box';
import { useState, useEffect, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import * as htmlToImage from 'html-to-image';
import debounce from 'lodash.debounce';

// Stored in public folder
const dataUrl = '/world_universities_and_domains.json';

function App() {
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(dataUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setData(data))
      .catch(error => console.error('There has been a problem with your fetch operation:', error));
  }, []);

  const handleSearch = useCallback(debounce((event) => {
    setSearchQuery(event.target.value);
  }, 300), []);

  const downloadImage = async (id, name) => {
    const node = document.getElementById(id);
    const button = node.querySelector('button'); 

    if (button) {
      button.style.display = 'none'; 
    }

    try {
      const dataUrl = await htmlToImage.toJpeg(node, { quality: 0.95 });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${name}.jpeg`;
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
    } finally {
      if (button) {
        button.style.display = ''; 
      }
    }
  };

  const filteredData = data 
    ? data.filter(item => item.country.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="App">
      <Box sx={{ padding: '20px' }}>
        <TextField 
          label="Search by Country" 
          variant="outlined" 
          fullWidth 
          onChange={handleSearch} 
          sx={{ marginBottom: '20px' }}
        />
        {searchQuery === '' ? (
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            <h1> Search by Country</h1>
          </Typography>
        ) : filteredData.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            No university record exists with country name "{searchQuery}"
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {filteredData.map((item, index) => (
              <Box id={`card-${index}`} key={item.name} sx={{ width: '30%', margin: '10px', padding: '10px', border: '1px solid #ccc', position: 'relative', backgroundColor: 'white' }}>
                <Typography variant="h5" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Country: {item.country}
                </Typography>
                <Typography variant="body2">
                  Domains: {item.domains.join(', ')}
                </Typography>
                <Typography variant="body2">
                  Web Pages: <a href={item.web_pages[0]} target="_blank" rel="noopener noreferrer">{item.web_pages[0]}</a>
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ position: 'absolute', bottom: '10px', right: '10px' }} 
                  onClick={() => downloadImage(`card-${index}`, item.name)}
                >
                  Download
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </div>
  );
}

export default App;
