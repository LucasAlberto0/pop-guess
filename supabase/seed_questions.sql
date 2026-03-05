CREATE TABLE IF NOT EXISTS question_pool (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'text'
    image_url TEXT,
    question TEXT NOT NULL,
    primary_answer TEXT NOT NULL,
    alternative_answers TEXT[] DEFAULT '{}',
    hints TEXT[] DEFAULT '{}',
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE question_pool ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for question_pool" ON question_pool
    FOR SELECT USING (true);

-- Insert 50 Image Questions (Pop Culture, Games, Places, Food, Animals, Daily Objects, Sports, Memes/Zoom)
INSERT INTO question_pool (type, image_url, question, primary_answer, alternative_answers, hints, category, difficulty) VALUES
-- CULTURA POP
('image', 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Walter_White_S5B.png/220px-Walter_White_S5B.png', 'Quem é esse professor de química que virou o Heisenberg?', 'Walter White', '{"Heisenberg", "Bryan Cranston"}', '{"Breaking Bad"}', 'Cultura Pop', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/pt/d/d4/Harry_Potter_e_a_Pedra_Filosofal_2001.jpg', 'Qual o nome do bruxo com a cicatriz de raio?', 'Harry Potter', '{"Potter", "Harry"}', '{"Hogwarts"}', 'Cultura Pop', 'easy'),
('image', 'https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgzOF5BMl5BanBnXkFtZTgwNTkwNTQ3NjM@._V1_.jpg', 'Quem é esse herói aracnídeo da Marvel?', 'Homem-Aranha', '{"Spider-Man", "Peter Parker"}', '{"Vingadores"}', 'Cultura Pop', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/pt/a/a2/Goku_em_Dragon_Ball_Super.png', 'Quem é esse guerreiro saiyajin que ama lutar?', 'Goku', '{"Son Goku", "Kakarotto"}', '{"Dragon Ball Z"}', 'Cultura Pop', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Vader_77.png/220px-Vader_77.png', 'Quem disse a frase: "Eu sou seu pai"?', 'Darth Vader', '{"Anakin", "Vader"}', '{"Star Wars"}', 'Cultura Pop', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/pt/e/eb/Joker_%28The_Dark_Knight%29.jpg', 'Qual o vilão mais famoso do Batman?', 'Coringa', '{"Joker", "The Joker"}', '{"Risonho"}', 'Cultura Pop', 'easy'),

-- GAMES
('image', 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Super_Mario_Bros._Box_Art.png/220px-Super_Mario_Bros._Box_Art.png', 'Quem é esse encanador italiano da Nintendo?', 'Mario', '{"Super Mario"}', '{"Salva a Peach"}', 'Games', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/en/2/21/Link_Legend_of_Zelda.png', 'Qual o nome desse herói de Hyrule?', 'Link', '{"Zelda", "The Legend of Zelda"}', '{"Mestre da Espada"}', 'Games', 'medium'),
('image', 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Pikachu_artwork_for_Pok%C3%A9mon_Red_and_Blue.png/220px-Pikachu_artwork_for_Pok%C3%A9mon_Red_and_Blue.png', 'Qual o Pokémon mais famoso do mundo?', 'Pikachu', '{"Pika"}', '{"Elétrico"}', 'Games', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/en/0/03/Master_Chief_in_Halo_5.png', 'Quem é o protagonista da série Halo?', 'Master Chief', '{"Spartan 117", "John 117"}', '{"Halo"}', 'Games', 'medium'),
('image', 'https://upload.wikimedia.org/wikipedia/en/3/39/Kratos_GoW_2018.png', 'Quem é o Fantasma de Esparta?', 'Kratos', '{"God of War"}', '{"Boy!"}', 'Games', 'easy'),

-- LUGARES
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Tour_Eiffel_2014.jpg/220px-Tour_Eiffel_2014.jpg', 'Em que cidade fica a Torre Eiffel?', 'Paris', '{"França"}', '{"Cidade Luz"}', 'Lugares', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Statue_of_Liberty_7.jpg/220px-Statue_of_Liberty_7.jpg', 'Em que cidade fica a Estátua da Liberdade?', 'Nova York', '{"New York", "NY"}', '{"EUA"}', 'Lugares', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Cristo_Redentor_-_Rio_de_Janeiro%2C_Brasil.jpg/220px-Cristo_Redentor_-_Rio_de_Janeiro%2C_Brasil.jpg', 'Como se chama esse monumento no Rio de Janeiro?', 'Cristo Redentor', '{"Cristo"}', '{"Brasil"}', 'Lugares', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/220px-Taj_Mahal_in_March_2004.jpg', 'Onde fica o Taj Mahal?', 'Índia', '{"Agra"}', '{"Mausoléu"}', 'Lugares', 'medium'),

-- COMIDA
('image', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', 'Que prato italiano é esse?', 'Pizza', '{"Piza"}', '{"Massa"}', 'Comida', 'easy'),
('image', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'Que clássico do fast-food é esse?', 'Hambúrguer', '{"Hamburger", "X-Burger"}', '{"McDo"}', 'Comida', 'easy'),
('image', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', 'Este prato é típico de qual país?', 'Japão', '{"Sushi", "Sashimi"}', '{"Peixe cru"}', 'Comida', 'medium'),

-- ANIMAIS
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/220px-Lion_waiting_in_Namibia.jpg', 'Quem é o Rei da Selva?', 'Leão', '{"Leao"}', '{"Felino"}', 'Animais', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Giant_Panda_in_Wolong_Reserve.jpg/220px-Giant_Panda_in_Wolong_Reserve.jpg', 'Que urso preto e branco come bambu?', 'Panda', '{"Urso Panda"}', '{"China"}', 'Animais', 'easy'),

-- OBJETOS
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/IPhone_13_Pro_Sierra_Blue_Rendering.png/220px-IPhone_13_Pro_Sierra_Blue_Rendering.png', 'Qual o smartphone mais famoso da Apple?', 'iPhone', '{"Celular"}', '{"iOS"}', 'Objetos', 'easy'),
('image', 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$facebook$', 'Que console de videogame é este?', 'PlayStation 5', '{"PS5", "Playstation"}', '{"Sony"}', 'Objetos', 'easy'),

-- ESPORTES
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/220px-Cristiano_Ronaldo_2018.jpg', 'Qual o nome desse jogador português (CR7)?', 'Cristiano Ronaldo', '{"Ronaldo", "CR7"}', '{"Portugal"}', 'Esportes', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Lionel_Messi_20180626.jpg/220px-Lionel_Messi_20180626.jpg', 'Quem é esse gênio argentino do futebol?', 'Lionel Messi', '{"Messi"}', '{"Argentina"}', 'Esportes', 'easy'),
('image', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Nike_Apparel.jpg/220px-Nike_Apparel.jpg', 'Qual é esta marca esportiva famosa pelo "swoosh"?', 'Nike', '{"Naiki"}', '{"Just Do It"}', 'Esportes', 'easy'),

-- MEMES / ZOOM (DIFICIL)
('image', 'https://upload.wikimedia.org/wikipedia/en/5/5f/Doge_Keep_Calm_and_Dog_On.jpg', 'Qual o nome desse famoso meme do cachorro Shiba Inu?', 'Doge', '{"Cheems"}', '{"Cachorro"}', 'Memes', 'easy'),
('image', 'https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-245a-4cf0-bd63-097d28eb311d.jpg', 'Como se chama este famoso sapo meme?', 'Pepe', '{"Pepe the Frog"}', '{"Verde"}', 'Memes', 'medium');

-- Insert 20 Text Questions
INSERT INTO question_pool (type, question, primary_answer, alternative_answers, hints, category, difficulty) VALUES
('text', 'Qual é o nome do robô que queria ser um menino em IA?', 'David', '{}', '{"Spielberg"}', 'Cultura Pop', 'hard'),
('text', 'Quem disse: "Luke, eu sou seu pai"?', 'Darth Vader', '{"Vader"}', '{"Star Wars"}', 'Cultura Pop', 'easy'),
('text', 'Qual é a capital da Austrália?', 'Camberra', '{"Canberra"}', '{"Não é Sydney"}', 'Lugares', 'medium'),
('text', 'Qual o elemento químico com símbolo Au?', 'Ouro', '{"Gold"}', '{"Metal precioso"}', 'Educação', 'medium'),
('text', 'Em que ano o homem pisou na Lua pela primeira vez?', '1969', '{}', '{"Anos 60"}', 'História', 'medium'),
('text', 'Quem pintou a Mona Lisa?', 'Leonardo da Vinci', '{"Da Vinci"}', '{"Renascimento"}', 'Cultura Pop', 'medium'),
('text', 'Qual o maior planeta do sistema solar?', 'Júpiter', '{"Jupiter"}', '{"Gigante gasoso"}', 'Educação', 'easy'),
('text', 'Quem é o autor de Dom Casmurro?', 'Machado de Assis', '{"Machado"}', '{"Brasil"}', 'Literatura', 'medium'),
('text', 'Qual o console de videogame mais vendido de todos os tempos?', 'PlayStation 2', '{"PS2"}', '{"Sony"}', 'Games', 'medium'),
('text', 'De que banda é a música "Bohemian Rhapsody"?', 'Queen', '{}', '{"Freddie Mercury"}', 'Cultura Pop', 'easy'),
('text', 'Como se chama o martelo do Thor?', 'Mjölnir', '{"Mjolnir"}', '{"Marvel"}', 'Cultura Pop', 'hard'),
('text', 'Qual a velocidade da luz (aprox. em km/s)?', '300000', '{}', '{"Vácuo"}', 'Educação', 'hard'),
('text', 'Qual país venceu a Copa do Mundo de 2022?', 'Argentina', '{}', '{"Messi"}', 'Esportes', 'easy'),
('text', 'Quem é o CEO da Tesla?', 'Elon Musk', '{"Musk"}', '{"SpaceX"}', 'Negócios', 'easy'),
('text', 'Como se chama a moeda do Japão?', 'Iene', '{"Yen"}', '{"Asia"}', 'Lugares', 'medium'),
('text', 'Qual o rio mais longo do mundo?', 'Amazonas', '{"Nilo"}', '{"Brasil"}', 'Natureza', 'medium'),
('text', 'Quem escreveu a saga Harry Potter?', 'J.K. Rowling', '{"Rowling"}', '{"Escritora"}', 'Literatura', 'easy'),
('text', 'Qual o nome do fundador da Microsoft?', 'Bill Gates', '{"Gates"}', '{"Windows"}', 'Negócios', 'easy'),
('text', 'Em que cidade fica a sede da ONU?', 'Nova York', '{"New York"}', '{"EUA"}', 'Lugares', 'medium'),
('text', 'Qual a principal linguagem de programação para web?', 'JavaScript', '{"JS", "Javascript"}', '{"Frontend"}', 'Tecnologia', 'easy');
