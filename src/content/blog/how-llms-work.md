---
title: "How Large Language Models Actually Work"
description: "How large language models like Claude work: transformer architecture, tokenization, training, and inference explained clearly."
date: "2026-02-12"
category: "ai"
image: "/images/blog/how-llms-work.svg"
author: "Kenneth Abueg"
tags: ["ai", "llm", "transformers", "machine learning", "claude"]
---

Large language models have become one of the most visible applications of artificial intelligence, powering everything from conversational assistants to code generators. Yet most people who use these tools daily have only a vague idea of how they actually work. This article explains the key concepts behind LLMs in practical terms, covering the architecture, training process, and mechanics that make them function.

## The Transformer Architecture

The foundation of every modern LLM is the transformer, an architecture introduced in a 2017 research paper titled "Attention Is All You Need." Before transformers, language models relied on [recurrent neural networks](/blog/understanding-neural-networks) that processed text sequentially, one word at a time. This sequential processing was slow and made it difficult for models to capture relationships between words that were far apart in a sentence.

Transformers solved this with a mechanism called self-attention. Instead of processing words one by one, a transformer can look at all the words in a sequence simultaneously and calculate how much each word should "attend to" every other word. When processing the sentence "The cat sat on the mat because it was tired," the self-attention mechanism helps the model understand that "it" refers to "the cat" rather than "the mat."

A transformer consists of layers stacked on top of each other, each containing attention mechanisms and feed-forward neural networks. Modern LLMs have dozens or even hundreds of these layers. Claude models and other frontier LLMs use transformer-based architectures that have been refined and scaled to handle increasingly complex tasks.

Each layer refines the model's internal representation of the text. Early layers tend to capture basic syntactic patterns like subject-verb agreement. Middle layers capture more semantic relationships. Later layers capture high-level abstractions that allow the model to generate coherent, contextually appropriate responses.

## Tokenization: How Text Becomes Numbers

Before a transformer can process text, that text needs to be converted into numbers. This is where tokenization comes in. A tokenizer breaks text into smaller units called tokens, which might be words, parts of words, or even individual characters.

Most modern LLMs use subword tokenization, a method that breaks common words into single tokens while splitting rare or complex words into multiple pieces. The word "understanding" might be a single token, while "tokenization" might be split into "token," "ization." This approach balances vocabulary size with the ability to handle any text, including misspellings, technical jargon, and multiple languages.

Each token maps to a numerical ID in the model's vocabulary, which typically contains between 30,000 and 100,000 entries. These IDs are then converted into high-dimensional vectors called embeddings that capture semantic meaning. Words with similar meanings end up with similar embeddings, which is how the model develops an understanding of language relationships.

The tokenization step has practical implications. When you hear that a model has a "context window" of 200,000 tokens, that does not translate directly to 200,000 words. On average, one token corresponds to roughly three-quarters of a word in English, so 200,000 tokens is approximately 150,000 words. The context window determines how much text the model can consider at once when generating a response.

## The Training Process

Training an LLM happens in stages, each building on the previous one.

**Pre-training** is the most computationally expensive phase. The model processes enormous amounts of text, often hundreds of billions of words drawn from books, websites, code repositories, and other sources. During pre-training, the model learns to predict the next token in a sequence. Given "The capital of France is," the model learns that "Paris" is the most likely next token.

This simple objective, next-token prediction, turns out to be remarkably powerful. To predict the next word accurately across diverse texts, the model must learn grammar, facts, reasoning patterns, writing styles, and much more. The model is not explicitly taught any of these things. They emerge as a consequence of learning to predict text well.

**Fine-tuning** comes after pre-training and adapts the model for specific use cases. A common approach is instruction tuning, where the model is trained on examples of instructions paired with high-quality responses. This teaches the model to follow directions rather than simply continuing text.

**Alignment training** is a critical step for models designed to be helpful and safe. Techniques like Reinforcement Learning from Human Feedback (RLHF) and Constitutional AI use human preferences and predefined principles to steer the model's behavior. [Understanding AI ethics](/blog/ai-ethics-guide) is essential for developing systems that respond helpfully rather than generating harmful, biased, or unhelpful content.

The entire training process for a frontier LLM requires thousands of specialized GPUs running for weeks or months, consuming enormous amounts of electricity. This computational cost is one reason why only a handful of organizations can train models at the largest scales.

## How Inference Works

Inference is what happens when you actually use an LLM, when you send it a prompt and receive a response. Understanding inference explains many behaviors users observe.

When you submit a prompt, the model processes all your input tokens through its layers to build an internal representation of your request. It then generates a response one token at a time. For each new token, the model calculates a probability distribution over its entire vocabulary and selects the next token based on those probabilities.

The selection process is not purely deterministic. A parameter called "temperature" controls how random the selection is. At low temperatures, the model almost always picks the most probable token, producing predictable and focused output. At higher temperatures, the model is more willing to select less probable tokens, producing more creative and varied output. [Effective prompt engineering](/blog/prompt-engineering-guide) considers these parameters when crafting requests.

This token-by-token generation is why LLMs can sometimes produce inconsistencies. Each token is chosen based on the context that came before it, but the model does not have a global plan for the entire response. It is more like an expert improviser than a careful editor.

## Capabilities and Limitations

Understanding the mechanics of LLMs clarifies both their impressive capabilities and their inherent limitations.

LLMs are extraordinarily capable at tasks that can be framed as text generation. They can write, summarize, translate, answer questions, write code, analyze data, and reason through problems. These abilities emerge from the patterns learned during training on vast text corpora.

However, LLMs have real limitations. They can produce plausible-sounding but incorrect information, a phenomenon known as hallucination. They do not have access to real-time information unless connected to external tools. They can struggle with precise mathematical calculations, as these require exact computation rather than pattern matching.

LLMs also do not "understand" text the way humans do. They process statistical relationships between tokens. Whether this constitutes genuine understanding is a philosophical debate, but from a practical standpoint, what matters is that LLMs produce useful outputs for many tasks while requiring human oversight for high-stakes decisions.

The field continues to evolve rapidly. Researchers are working on longer context windows, more efficient architectures, better reasoning capabilities, and improved alignment techniques. Each generation of models addresses some limitations of the previous one while revealing new challenges to solve. Understanding how these systems work at a fundamental level prepares you to use them effectively and evaluate new developments critically.
