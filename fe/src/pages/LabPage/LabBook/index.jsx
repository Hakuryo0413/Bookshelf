import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box, Button, CardActionArea, Rating } from '@mui/material';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';
import axios from 'axios';

import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

const styleModal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    boxShadow: 24,
    brentRadius: '10px',
    p: 3,
};

function LabBook() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [openModalBook, setOpenModalBook] = useState(false);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [author, setAuthor] = useState('');
    const [language, setLanguage] = useState('');
    const [publishYear, setPublishYear] = useState('');

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await axios.get('http://localhost:5001/book/allBooks');
                // console.log(res.data);
                setBooks(res.data);
            } catch (e) {
                console.log(e);
            }
        };
        getData();
    }, []);

    const PriceVND = (price) => {
        const priceVND = Intl.NumberFormat('en-US').format;
        return priceVND(price);
    };

    return (
        <>
            <Box
                id="style-2"
                sx={{
                    backgroundColor: '#f3f3f7',
                    width: 'calc(100% - var(--default-layout-width-sidebar))',
                    height: 'calc(100vh - var(--default-layout-height-header))',
                    float: 'right',
                    overflowY: 'scroll',
                }}
            >
                <Button onClick={() => navigate('/lab')} variant="outlined" sx={{ margin: '10px' }}>
                    <KeyboardArrowLeftOutlinedIcon />
                    Quay lại
                </Button>

                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        marginLeft: '-10px',
                        marginRight: '-10px',
                        padding: '10px',
                    }}
                >
                    {books.map((book) => {
                        return (
                            <Box
                                key={book._id}
                                sx={{ width: '33.3333%', paddingLeft: '10px', paddingRight: '10px', margin: '20px 0' }}
                            >
                                <Card
                                    onClick={() => {
                                        setCode(book.code);
                                        setName(book.name);
                                        setImage(book.image);
                                        setPrice(book.price);
                                        setDescription(book.description);
                                        setCategory(book.category);
                                        setAuthor(book.author);
                                        setLanguage(book.language);
                                        setPublishYear(book.publishYear);
                                        setOpenModalBook(true);
                                    }}
                                >
                                    <CardActionArea>
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={book.image}
                                            alt="green iguana"
                                        />
                                        <CardContent>
                                            <Typography
                                                sx={{ color: '#666', fontSize: '1.2rem', height: '60px' }}
                                                variant="h5"
                                                component="div"
                                            >
                                                {book.name}
                                            </Typography>
                                            <Rating value={6} readOnly />
                                            <Typography
                                                sx={{ color: '#0e78fb', fontSize: '1rem' }}
                                                variant="h5"
                                                component="div"
                                            >
                                                Price : {PriceVND(book.price)} VND
                                            </Typography>
                                            {/* <Typography
                                                sx={{ color: '#666', fontSize: '1rem' }}
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {book.description}
                                            </Typography> */}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
            {/* Modal book */}
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={openModalBook}
                onClose={() => setOpenModalBook(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openModalBook}>
                    <Box sx={styleModal}>
                        <CardActionArea sx={{ display: 'flex' }}>
                            <CardMedia component="img" height="250" image={image} alt="green iguana" />
                            <CardContent>
                                <Typography
                                    sx={{ color: '#666', fontSize: '1.2rem', marginBottom: '10px' }}
                                    variant="h5"
                                    component="div"
                                >
                                    Mã sản phẩm: {code}
                                </Typography>
                                <Typography
                                    sx={{ color: '#666', fontSize: '1.2rem', marginBottom: '10px' }}
                                    variant="h5"
                                    component="div"
                                >
                                    Tên sản phẩm: {name}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: '#666',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '10px',
                                    }}
                                    variant="h5"
                                    component="div"
                                >
                                    Đánh giá: <Rating value={6} readOnly />
                                </Typography>

                                <Typography
                                    sx={{ color: '#0e78fb', fontSize: '1rem', marginBottom: '10px' }}
                                    variant="h5"
                                    component="div"
                                >
                                    Price : {PriceVND(price)} VND
                                </Typography>
                                <Typography
                                    sx={{ color: '#666', fontSize: '1rem', marginBottom: '10px' }}
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Mô tả: {description}
                                </Typography>
                                <Typography
                                    sx={{ color: 'red', fontSize: '1rem' }}
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Bảo hành: 1 năm
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}

export default LabBook;
