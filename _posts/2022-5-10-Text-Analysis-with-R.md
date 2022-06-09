---
title: Sentiment Analysis of 1984 Book by George Orwell
date: 2022-05-10 10:52:15 +0800
categories: [Data Science]
tags: [r, data science, sentiment-analysis]
---

# Sentiment Analysis of 1984 Book by George Orwell

Today we'll analyse the 1984 book written by George Orwell using R. 1984 is a dystopian social science fiction novel and it was published on 8 June 1949. It has 8 chapters for Part 1, 9 for Part 2 and 6 for Part 3. 3 of the main characters are Winston Smith, Julia and O'Brien. To know more about the plot, read [Wikipedia](https://en.wikipedia.org/wiki/Nineteen_Eighty-Four)

## Table of Contents
<!-- no toc -->
- [Goals](#goals)
- [Importing Library](#importing-library)
- [Downloading Data](#downloading-data)
- [Analysing data](#analysing-data)
  - [Word Cloud](#word-cloud)
  - [Sentiment Scores](#sentiment-scores)
  - [Words to Express Different Emotions and Sentiments](#words-to-express-different-emotions-and-sentiments)
  - [Words Contributed to Sentiment Scores by Parts](#words-contributed-to-sentiment-scores-by-parts)
  - [Mood Ring](#mood-ring)
  - [Polar Sentiment Preceded by NOT](#polar-sentiment-preceded-by-not)
  - [Negation Bigram Network](#negation-bigram-network)
- [Back to Goals](#back-to-goals)
- [Conclusion](#conclusion)
- [Resources](#resources)

## Goals

The problems we would like to discover are:

1. What are the most frequent words used?
2. Which are the positive and negative words prevalent in his book?
3. What are the overall sentiments expressed in his book?
4. Which are the top words used to describe different emotions?

## Importing Library

Here we will import all necessary libraries into the environment.
The libraries we will be using:

|Library |Function |Example  |
|---|---|---|
| [rvest](https://rvest.tidyverse.org/)  | For web scraping  | |
| [magrittr](https://cran.r-project.org/web/packages/magrittr/vignettes/magrittr.html)  | For chaning commands  | %>% |
|  [purr](https://purrr.tidyverse.org/) |Toolkit for functions and vectors   |map() |
|  [dplyr](https://dplyr.tidyverse.org/) | For data manipulation  |mutate(), `select()`, `filter()`, `summarise()`, `arrange()` |
|  [tidyr](https://tidyr.tidyverse.org/)|Help creating standard and tidy data   |`unnest()`, `seperate()`, `extract()`, `unite()`, `complete()`, `fill()`|
|[ggplot2](https://ggplot2.tidyverse.org/) | For creating graph |   |
|[tm](https://rpubs.com/tsholliger/301914#:~:text=The%20tm%20package%20utilizes%20the,enable%20certain%20types%20of%20analysis.)|For text mining||
|[wordcloud](https://www.data-to-viz.com/graph/wordcloud.html)|For plotting word cloud|
|[tidytext](https://cran.r-project.org/web/packages/tidytext/vignettes/tidytext.html)|Text mining tool that includes a lot of required packages|get_sentiments()|
|[circlize](https://r-graph-gallery.com/224-basic-circular-plot.html)|for plotting circular graph|
|[igraph](https://igraph.org/r/)|For plotting graph||
|[ggraph](https://ggraph.data-imaginist.com/)|Extension of `ggplot2` to support relational data structures such as networks, graphs and trees ||

```R
library(rvest)
library(magrittr)
library(purrr)
library(dplyr)

library(tidyr)
library(ggplot2)
library(tm)
library(wordcloud)
library(circlize)
library(tidytext)
library(reshape2)
library(igraph)
library(ggraph)
```

> `%>%` forward a value of a result of an expression into the next function

## Downloading Data

What's the most important thing in data science? DATA! To get the full text of 1984, I downloaded it from this [website](http://www.george-orwell.org/1984). Using inspection tool, you will notice that the url for each chapter has the form of `http://www.george-orwell.org/1984/{no_of_chapter}` so we can scrape the data by using `rvest library`. Here, we will save the text according to chapter and part.

```R
# Scrape 1984 text
part = 1
chap = 1

part_break = data.frame(
  chap = c(8, 9, 6)
)

for (x in 0:22){
  file = paste('part', part, '_', chap, ".txt",sep="")
  link = paste("http://www.george-orwell.org/1984/",toString(x),".html", sep="")
  text = read_html(link) %>%
    html_nodes("p") %>%
    html_text()
  text = text[4]

  write(text, file = file, append=TRUE)
  if (x != 0 & chap == part_break[part, 1]){
    part = part + 1
    chap = 1
  }
  else{chap = chap + 1}
}
```

Then we will get:

```R
files_name = list.files(path = '.', pattern = "part[123]_[1-9].txt")

#  [1] "part1_1.txt" "part1_2.txt" "part1_3.txt"
#  [4] "part1_4.txt" "part1_5.txt" "part1_6.txt"
#  [7] "part1_7.txt" "part1_8.txt" "part2_1.txt"
# [10] "part2_2.txt" "part2_3.txt" "part2_4.txt"
# [13] "part2_5.txt" "part2_6.txt" "part2_7.txt"
# [16] "part2_8.txt" "part2_9.txt" "part3_1.txt"
# [19] "part3_2.txt" "part3_3.txt" "part3_4.txt"
# [22] "part3_5.txt" "part3_6.txt"
```

Now, we will make a data frame out of the text files we have downloaded. The data frame should look like this:

|part |chapter |text  |
|---|---|---|
|  1 | 1  | Some text |

```R
# extract part and chapter
# part1_1 => 1_1
files_name = list.files(path = '.', pattern = "part[123]_[1-9].txt")
# empty data frame
df = data.frame(matrix(ncol = 3, nrow = 23))
colnames(df) = c("part", "chapter", "text")

# put data into data frame
for (x in 1:length(files_name)){
  file_name = files_name[x]
  # 1_1 => [[1,1]]
  part_chap = gsub("part|.txt", "",file_name)
  part_chap = strsplit(part_chap,"_")[[1]]
  text = readLines(file_name)
  text = paste(text, collapse="\n")
  df[x,] = c(part_chap[1], part_chap[2], text)
}
```

## Analysing data

Here we will be using lexicons to get the sentiment value.

Lexicons available:

|Lexicon |Sentiments | Output|
|---|---|---|
|  bing | Positive, Negative |[-1, 1]|
|nrc|Positive, Negative, Anger, Anticipation, Disgust, Fear, Joy, Sadness, Surprise, Trust|[-1, 1]|
|afinn|Positive, Negative|[-5, 5]|

Do note that all these lexicons are based on unigrams. So it _can't_ process preceeding words that affect the scores of sentiments such as "not", "never". Besides, lexicons like `bing` and `nrc` give _same_ value for "very happy" and "happy" which should have _different_ sentiments value.

We will also use `tidy_text` library, and the common flow is as below:

![Flow Chart](/assets/images/text-analysis-with-R/flowchart_text_analysis.png "Flow Chart for Text Analysis with tidy_text")

### Word Cloud

Before we analyse the text, we will first convert the full text into [text corpus](https://hypersense.subex.com/aiglossary/corpus/). Text corpus is just a collections of documents that has specific attributes and is mostly used in machine learning and NLP.

```R
book_text = df$text
# create text corpus
docs = Corpus(VectorSource(book_text))
# inspect content of document
# inspect(docs) # uncomment to inspect
```

We will be using `wordcloud` package and before using it, we will first clean the data by removing numbers, punctuation, white space and turn the content into lowercase. Then, we will remove english common stopwords such as `is` and `am` as these are not what we want to get from the analysis and they will pollute the data. All of these processes will be implemented by library `tm`.

```R
# Remove punctuations and alphanumeric content
docs = docs %>% 
  tm_map(removeNumbers) %>%
  tm_map(removePunctuation) %>%
  tm_map(stripWhitespace)
docs = tm_map(docs, content_transformer(tolower))
# remove english common stopwords
docs = tm_map(docs, removeWords, stopwords("english"))
```

Then, we will create term document matrix and convert it into a matrix.

![Term Document Matrix](/assets/images/text-analysis-with-R/termDocumentMatrix.png "Term Document Matrix")_Term Document Matrix_

```R
# create term document matrix
tdm = TermDocumentMatrix(docs)
# define tdm as matrix
m = as.matrix(tdm)
```

![Matrix](/assets/images/text-analysis-with-R/tdmToMatrix.png "Matrix")_Matrix_

Next, perform summation along the row to and convert to data frame with words and their frequency as columns.

```R
word_freqs = sort(rowSums(m), decreasing=TRUE)
# creating a data frame with words and their frequencies
text_wc_df = data.frame(word=names(word_freqs), freq=word_freqs)
text_wc_df = text_wc_df[1:300,]
```

![Text_wc_df](/assets/images/text-analysis-with-R/textWordCloudDF.png "text_wc_df")_Text_wc_df

Okay it's finally the time we plot the word cloud and the corresponding barplot!

```R
# plotting word cloud
set.seed(1234)
wordcloud(words = text_wc_df$word, freq = text_wc_df$freq,
          min.freq = 1, scale = c(1.8, .5),
          max.words=200, random.order=FALSE, rot.per=0.3,
          colors=brewer.pal(8, "Dark2"))


# barplot
barplot(text_wc_df[1:10,]$freq, las = 2, names.arg = text_wc_df[1:10,]$word,
        col = "lightblue", main="Most frequent words",
        ylab = "Word frequencies")
```

![Word Cloud](/assets/images/text-analysis-with-R/word_cloud.png "Word Cloud")_Most Frequent Word in Word Cloud_ ![Bar Plot](/assets/images/text-analysis-with-R/barplot.png "Bar Plot") _Most Frequent Word in Bar Plot_

Here we can notice that the most frequent word is "Winston" whom is the protagonist of 1984 and the word "Obrien", the 9th frequent word, is the name of an inner leader whom the protagonist trusted wrongly as the opposition leader.

### Sentiment Scores

Now let's look at the sentiment scores of the book.
We will use the `syuzhet` library's method, `get_sentiment` which will calculate the scores of each sentiments, namely 'anger', 'anticipation', 'disgust', 'fear', 'joy', 'negative', 'positive', 'sadness', 'surprise' and 'trust'

```R
# sentiment value for text
text_sentiment = get_nrc_sentiment((book_text))
sentiment_scores = data.frame(colSums(text_sentiment[,]))

names(sentiment_scores) = "Score"
sentiment_scores = cbind("sentiment" = rownames(sentiment_scores),sentiment_scores)
rownames(sentiment_scores) = NULL
```

Plotting the graph:

```R
# Plot for the cumulative sentiments
ggplot(data=sentiment_scores,aes(x=sentiment,y=Score))+
  geom_bar(aes(fill=sentiment),stat = "identity")+
  theme(legend.position="none")+
  xlab("Sentiments")+ylab("Scores")+
  ggtitle("Total sentiment based on scores")+
  theme_minimal()
```

![Total sentiment based on scores](/assets/images/text-analysis-with-R/total_sentiment.png "Total sentiment based on scores")_Total Sentiment Based on Scores_

We can know that the book used more negative words than the postives. What surprise me is that the score for trust is quite high, it is one of the top 4 sentiments. I think this happens as the writer describes about how Winston trusted O'brien as the opposition leader.

### Words to Express Different Emotions and Sentiments

Here, we will look at the words used to express different emotions and sentiments in this book. But first we have to tokenise the text by using `tidy_text` library.

```R
df$text = as.character(df$text)
tidy_text = df %>%
  unnest_tokens(word, text)
```

We will use lexicon `nrc` from `syuzhet` just as the above and then count the occurence of word and group them by sentiment. Then we select the top 10 words for each sentiment and plot them out.

```R
# Words used to express emotions
text_sentiment = tidy_text %>%
  inner_join(get_sentiments("nrc"), by="word", copy=TRUE)

text_sentiment %>%
  count(word, sentiment, sort=TRUE) %>%
  group_by(sentiment) %>% top_n(n=10) %>%
  ungroup() %>%
  ggplot(aes(x=reorder(word,n), y=n, fill = sentiment)) +
  geom_col(show.legend = FALSE) +
  facet_wrap(~sentiment, scales = "free")+
  xlab("Sentiments") + ylab("Scores")+
  ggtitle("Top words used to express emotions and sentiments") +
  coord_flip()
```

![Words to express emotions and sentiments](/assets/images/text-analysis-with-R/Words_to_express_emotions_sentiments.png "Words to express emotions and sentiments")_Words to Express Emotions and Sentiments_

It's interesting that the word "word" is considered as positive but its plural form "words" is negative. It's sarcastic that "brother", "ministry" and "police" are postive words which the readers will definetely considered them as negative words.

### Words Contributed to Sentiment Scores by Parts

Here, we will look at how the sentiment changes as the plot developed. We'll plot the sentiment scores for each part and the words used.

```R
# Sentiment score for every PARTs
text_sentiment_part = tidy_text %>%
  inner_join(get_sentiments("bing"), by="word", copy=TRUE) %>%
  count(word, sentiment, part, sort=TRUE) %>%
  group_by(sentiment) %>%
  ungroup() %>%
  mutate(word=reorder(word, n)) %>%
  group_by(part, sentiment) %>%
  top_n(n=5, wt=n) %>%
  mutate(part_sentiment=paste0(part, "-", sentiment)) %>%
  arrange(part, sentiment, n)

text_sentiment_part$part_sentiment = factor(text_sentiment_part$part_sentiment,
                                            levels = unique(text_sentiment_part$part_sentiment))

text_sentiment_part %>%
  ggplot(aes(x=word, n, fill=sentiment))+
  geom_col(show.legend = FALSE) +
  facet_wrap(~part_sentiment, scales="free_y", ncol=2)+
  labs(title = "Sentiment Scores by Parts",
       y = "Number of Times of Words Appearead",
       x="Words") +
  coord_flip()
```

![Sentiment Scores by Parts](/assets/images/text-analysis-with-R/sentiment_scores_by_parts.png "Sentiment Scores by Parts")_Sentiment scores by parts_

We can conclude that the story get more and more negative and less positive when the plot developed. In Part 3, the writer used a lot of "pain" word in the text and if you've actually read the book, Part 3 is writing about how the Party torture the Thought Criminals.

### Mood Ring

This is the graph I personally like the most. This graph explains how each part of the book contributed to every emotion.

Same, we will get the sentiments scores by `nrc` and filter away the 2 columns, namely `positive` and `negative`.

```R
# Mood Ring
grid.col = c("1" = "#51BBFE", "2" = "#8FF7A7", "3" = "#F4E76E", "anger" = "grey", "anticipation" = "grey", "disgust" = "grey", "fear" = "grey", "joy" = "grey", "sadness" = "grey", "surprise" = "grey", "trust" = "grey")

part_mood = tidy_text %>%
  inner_join(get_sentiments("nrc"))%>%
  filter(!sentiment %in% c("positive", "negative")) %>%
  count(sentiment, part) %>%
  group_by(part, sentiment) %>%
  summarise(sentiment_sum = sum(n)) %>%
  ungroup()
```

![part_mood](/assets/images/text-analysis-with-R/part_mood.png "part_mood")_Mood in Every Parts_
Notice that `negative` and `positive` columns are removed.

Then, we count the sentiment scores by part and plot them out.

```R
circos.clear()
circos.par(gap.after = c(rep(5, length(unique(part_mood[[1]])) - 1 ), 15,
                         rep(5, length(unique(part_mood[[2]])) - 1 ), 15))
chordDiagram(part_mood, grid.col = grid.col, transparency = .2)
title("Relationship Between Mood and Part")
```

![Mood Ring](/assets/images/text-analysis-with-R/relationship_mood_part.png)_Relationship between Mood and Part_

We can clearly see that Part 2 contributes the most to the mood and Part 3 contributes the least. The highest mood scores in Part 2 are trust and anticipation. This makes sense as Part 2 is saying Winston, the protagonist thinks that O'Brien is someone like him, who secretly hates the Party.

### Polar Sentiment Preceded by NOT

What we did just now is analyse sentiment by seperating sentence into 1 word. However, in real-life we uses a lot of negation words such as "not". One-word analysis actually groups them into the opposite sentiment.

Now we will look at the most frequent words that are mistakenly grouped into the opposite sentiment.

Here, we will use the `unnest_tokens` from `tidytext` libray to tokenise 2 words. Then we split them into 2 seperate columns, each with 1 word.

```R
text_bigrams = df %>%
  unnest_tokens(bigram, text, token = "ngrams", n=2)
bigrams_seperated = text_bigrams %>%
  separate(bigram, c("word1", "word2"), sep= " ")
```

Since we only want 2 consecutive words that starts with "not", we will filter out the rest.

```R
not_words = bigrams_seperated %>%
  filter(word1 == "not") %>%
  inner_join(get_sentiments("afinn"), by=c(word2 = "word")) %>%
  count(word2, value, sort =TRUE) %>%
  ungroup()
```

Finally, we plot out the top 20 words.

```R
not_words %>%
  mutate(contribution = n*value) %>%
  arrange(desc(abs(contribution))) %>%
  head(20) %>%
  mutate(word2 = reorder(word2, contribution)) %>%
  ggplot(aes(word2, n*value, fill = n * value > 0)) +
  geom_col(show.legend = FALSE) +
  xlab("Words perceded by not") +
  ylab("Sentiment score * Number of Occurences") +
  ggtitle("Polar Sentiment of Words Preceded by Not") +
  coord_flip()
```

![Negation Bigram](/assets/images/text-analysis-with-R/polar_sentiment_preceded_not.png "Negation Bigram")_Negation Bigram_

Here we can see that words such as "help" is preceded by "not" a lot in the text which has negative sentiments but it is counted as positive sentiment if we use 1 word in computing sentiment value.

### Negation Bigram Network

The negation bigram network is similar to polar sentiment graph, but the difference here is instead of considering the case for "not" only, we add more negation words("not", "no", "never", "without") and plot the network graph to see the relationship between negation words and the negated words.

```R
negation_words = c("not", "no", "never", "without")
negation_bigrams = bigrams_seperated %>%
  filter(word1 %in% negation_words) %>%
  inner_join(get_sentiments("afinn"), by=c(word2="word")) %>%
  count(word1, word2, value, sort = TRUE) %>%
  mutate(contribution = n *value) %>%
  arrange(desc(abs(contribution))) %>%
  group_by(word1) %>%
  slice(seq_len(20)) %>%
  arrange(word1, desc(contribution)) %>%
  ungroup()

bigram_graph = negation_bigrams %>%
  graph_from_data_frame() # from 'igraph'

a = grid::arrow(type ="closed", length = unit(.15, "inches"))

ggraph(bigram_graph, layout='fr')+
  geom_edge_link(alpha=.25)+
  geom_edge_density(aes(fill=value))+
  geom_node_point(color="purple1", size=1) + 
  geom_node_text(aes(label=name), repel=TRUE)+
  theme_void()+theme(legend.position = 'none',
                     plot.title = element_text(hjust=0.5)) +
  ggtitle("Negation Bigram Network")
```

![Negation Bigram Network](/assets/images/text-analysis-with-R/negation_bigram_network.png "Negation Bigram Network")_Negation Bigram Network_

## Problems with `get_sentiments`

## Back to Goals

Wew we have done a lot huh! Now let's look back our goals and answer them all!

1. What are the most frequent words used?
    - "Winston" with 440 frequency
2. Which are the positive and negative words prevalent in his book?
    - Positive: "kind", "brother", "feeling", "word", "ministry"
    - Negative: "war", "pain", "feeling", "small", "words"
3. What are the overall sentiments expressed in his book?
    - The book is written in negative tone.
4. Which are the top words used to describe different emotions?
    - Anger: "feeling", "words"
    - Anticipation: "time", "thought"
    - Disgust: "feeling", "death"
    - Fear: "war", "pain"
    - Joy: "kind", "feeling"
    - Sadness: "pain", "feeling"
    - Surprise: "feeling", "suddenly"
    - Trust: "kind", "brother"

## Conclusion

We have used a lot of library to do the task. First we scapes the text data from the Internet, then we store them in the local storage and turn them into data frame.

We also use `syuzhet` library to get the sentiment score using different lexicons, namely `bing`, `nrc` and `afinn`.

We plotted some graphs to perform text analysis, below are the graphs that we've plotted:

<!-- no toc -->
- [Word Cloud](#word-cloud)
- [Sentiment Scores](#sentiment-scores)
- [Words to Express Different Emotions and Sentiments](#words-to-express-different-emotions-and-sentiments)
- [Words Contributed to Sentiment Scores by Parts](#words-contributed-to-sentiment-scores-by-parts)
- [Mood Ring](#mood-ring)
- [Polar Sentiment Preceded by NOT](#polar-sentiment-preceded-by-not)
- [Negation Bigram Network](#negation-bigram-network)

## Resources

- [The Data Science of “Someone Like You” or Sentiment Analysis of Adele’s Songs](https://www.kdnuggets.com/2018/09/sentiment-analysis-adele-songs.html)
- [Sentiment Analysis of Colorado Flood Tweets in R](https://www.earthdatascience.org/courses/earth-analytics/get-data-using-apis/sentiment-analysis-of-twitter-data-r/)
- [Text mining and word cloud fundamentals in R](http://www.sthda.com/english/wiki/text-mining-and-word-cloud-fundamentals-in-r-5-simple-steps-you-should-know)
- [Sentiment analysis with tidy data](https://www.tidytextmining.com/sentiment.html)
- [Tidy Sentiment Analysis in R](https://www.datacamp.com/tutorial/sentiment-analysis-R#descriptivestatistics)