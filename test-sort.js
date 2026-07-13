const translatedContents = [
  { id: '1', title: 'Zebra', summary: '', status: 'pending', createdAt: 100 },
  { id: '2', title: 'Apple', summary: '', status: 'pending', createdAt: 200 },
  { id: '3', title: 'Banana', summary: '', status: 'pending', createdAt: 300 },
];

let sortOrder = 'alpha';

const filtered = translatedContents.filter((c) => true);
const sorted = filtered.sort((a, b) => {
  if (sortOrder === 'alpha') {
    return a.title.localeCompare(b.title);
  } else if (sortOrder === 'oldest') {
    return (a.createdAt || 0) - (b.createdAt || 0);
  } else {
    return (b.createdAt || 0) - (a.createdAt || 0);
  }
});

console.log('Alpha:', sorted.map(c => c.title));

sortOrder = 'oldest';
const sorted2 = translatedContents.filter(c => true).sort((a, b) => {
  if (sortOrder === 'alpha') {
    return a.title.localeCompare(b.title);
  } else if (sortOrder === 'oldest') {
    return (a.createdAt || 0) - (b.createdAt || 0);
  } else {
    return (b.createdAt || 0) - (a.createdAt || 0);
  }
});
console.log('Oldest:', sorted2.map(c => c.title));

sortOrder = 'latest';
const sorted3 = translatedContents.filter(c => true).sort((a, b) => {
  if (sortOrder === 'alpha') {
    return a.title.localeCompare(b.title);
  } else if (sortOrder === 'oldest') {
    return (a.createdAt || 0) - (b.createdAt || 0);
  } else {
    return (b.createdAt || 0) - (a.createdAt || 0);
  }
});
console.log('Latest:', sorted3.map(c => c.title));
