"don't be backwards compatible with silly vi options
set nocompatible

" * Search & Replace

" make searches case-insensitive, unless they contain upper-case letters:
set ignorecase
set smartcase

" show the `best match so far' as search strings are typed:
set incsearch

" assume the /g flag on :s substitutions to replace all matches in a line:
set gdefault

" * User Interface

" fancy colorscheme
if has('gui_running')
    :colorscheme darkdevel
else
    :colorscheme southernlights
endif

if !has('nvim')
    set ttymouse=xterm2
endif

if exists("g:gui_vimr")
  " VimR specific settings
endif

" show line and column numbers
set ruler

" always show status line
set laststatus=2

" Always display the tabline, even if there is only one tab
set showtabline=2

" we are always using a color terminal. this isn't the 1980s...
set t_Co=256

" have syntax highlighting in terminals which can display colours:
if has('syntax') && (&t_Co > 2)
  syntax on
endif

" remember gvim's size and position.
" from: http://vim.wikia.com/wiki/Restore_screen_size_and_position
source $HOME/.vim/gui_position.vim

" have fifty lines of command-line (etc) history:
set history=50

" have command-line completion <Tab> (for filenames, help topics, option names)
" first list the available options and complete the longest common part, then
" have further <Tab>s cycle through the possibilities:
set wildmode=list:longest,full

" don't display the current mode and partially-typed commands in the status line:
set noshowmode
set noshowcmd

" have the mouse enabled all the time:
set mouse=a

" don't have files trying to override this .vimrc:
set nomodeline

" * Keystrokes -- Moving Around

" have the h and l cursor keys wrap between lines (like <Space> and <BkSpc> do
" by default), and ~ covert case over line breaks; also have the cursor keys
" wrap in insert mode:
set whichwrap=h,l,~,[,]

" * Keystrokes -- Insert Mode

" allow <BkSpc> to delete line breaks, beyond the start of the current
" insertion, and over indentations:
set backspace=eol,start,indent

" have <Tab> (and <Shift>+<Tab> where it works) change the level of
" indentation:
inoremap <Tab> <C-T>
inoremap <S-Tab> <C-D>
" for command mode
" nmap <S-Tab> <<
" for insert mode
" imap <S-Tab> <Esc><<i
" [<Ctrl>+V <Tab> still inserts an actual tab character.]

"flag problematic whitespace (trailing and spaces before tabs)
"Note you get the same by doing let c_space_errors=1 but
"this rule really applys to everything.
highlight RedundantSpaces term=standout ctermbg=red guibg=red
match RedundantSpaces /\s\+$\| \+\ze\t/ "\ze sets end of match so only spaces highlighted

"use :set list! to toggle visible whitespace on/off
set listchars=tab:>-,trail:.,extends:>

" sane defaults
set shiftwidth=4
set smartindent
set autoindent
set tabstop=8
set expandtab
set textwidth=119
set encoding=utf-8

" Append modeline after last line in buffer.
" Use substitute() instead of printf() to handle '%%s' modeline in LaTeX
" files.
function! AppendModeline()
  let l:modeline = printf(" vim: set ts=%d sw=%d tw=%d %set :",
          \ &tabstop, &shiftwidth, &textwidth, &expandtab ? '' : 'no')
            let l:modeline = substitute(&commentstring, "%s", l:modeline, "")
  call append(line("$"), l:modeline)
  endfunction
let mapleader = ","
nnoremap <silent> <Leader>ml :call AppendModeline()<CR>

" * Plugin Configs

" added the sys.path.append so that powerline import works in virtualenv
" the three powerline import lines do not work in virtualenv otherwise
" if has('python3')
"     python3 import sys; sys.path.append("/usr/lib/python3.9/site-packages/")
"     python3 from powerline.vim import setup as powerline_setup
"     python3 powerline_setup()
"     python3 del powerline_setup
" endif

" tabbar options, don't run in vimdiff'
if &diff
    let g:miniBufExplMapWindowNavVim    = 0
    let g:miniBufExplMapWindowNavArrows = 0
    let g:miniBufExplMapCTabSwitchBufs  = 0
    let g:miniBufExplModSelTarget       = 0
else
    let g:miniBufExplMapWindowNavVim    = 1
    let g:miniBufExplMapWindowNavArrows = 1
    let g:miniBufExplMapCTabSwitchBufs  = 1
    let g:miniBufExplModSelTarget       = 1
endif

" syntastic options
let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_loc_list_height=3
let g:syntastic_echo_current_error  = 1
let g:syntastic_enable_signs        = 1
let g:syntastic_enable_highlighting = 1
let g:syntastic_python_checkers = ['flake8', 'pylint']
let g:syntastic_python_python_exec = '/usr/bin/env python3'

" See: http://upload.wikimedia.org/wikipedia/en/1/15/Xterm_256color_chart.svg
highlight SyntasticWarning guibg=yellow guifg=black ctermfg=016 ctermbg=226
highlight SyntasticError   guibg=red guifg=white ctermfg=255 ctermbg=160

" YouCompleteMe options
let g:ycm_key_list_select_completion = ['<Down>']
let g:ycm_key_list_previous_completion = ['<Up>']
"let g:ycm_autoclose_preview_window_after_completion = 1
let g:ycm_autoclose_preview_window_after_insertion = 1

" NERDTree
"nnoremap <silent><Leader>nt :NERDTreeToggle<CR>
"let NERDTreeShowHidden=1

" ignore certain files
"let NERDTreeIgnore = ['__pycache__', '\.sw[po]$']

" Tagbar
nmap <Leader>tb :TagbarToggle<CR>

" open tagbar when opening Vim with a supported file/files
autocmd FileType * call tagbar#autoopen(0)

" open Tagbar when opening a supported file in an already running Vim
autocmd BufEnter * nested :call tagbar#autoopen(0)

" With multiple tabs, open Tagbar in the current tab when
" you switch to an already loaded, supported buffer
autocmd FileType * nested :call tagbar#autoopen(0)

" Black
"
" run Black formatter on save
" autocmd BufWritePre *.py execute ':Black'

" F12 to run Black
nnoremap <Leader>bl :Black<CR>

" max line-length to use before wrapping
let g:black_linelength = 79

let g:black_virtualenv="~/.vim/black"

" whether Black should normalize string quoting
" let g:black_skip_string_normalization = 1

" AsciiDoctor

" What to use for HTML, default `asciidoctor`.
let g:asciidoctor_executable = 'asciidoctor'

" What extensions to use for HTML, default `[]`.
let g:asciidoctor_extensions = ['asciidoctor-diagram', 'asciidoctor-rouge']

" Fold sections, default `0`.
let g:asciidoctor_folding = 1

" Fold options, default `0`.
let g:asciidoctor_fold_options = 1

" List of filetypes to highlight, default `[]`
let g:asciidoctor_fenced_languages = ['python', 'c', 'javascript']

" Function to create buffer local mappings
fun! AsciidoctorMappings()
	nnoremap <buffer> <leader>oo :AsciidoctorOpenRAW<CR>
	nnoremap <buffer> <leader>op :AsciidoctorOpenPDF<CR>
	nnoremap <buffer> <leader>oh :AsciidoctorOpenHTML<CR>
	nnoremap <buffer> <leader>ox :AsciidoctorOpenDOCX<CR>
	nnoremap <buffer> <leader>ch :Asciidoctor2HTML<CR>
	nnoremap <buffer> <leader>cp :Asciidoctor2PDF<CR>
	nnoremap <buffer> <leader>cx :Asciidoctor2DOCX<CR>
endfun

" Call AsciidoctorMappings for all `*.adoc` and `*.asciidoc` files
augroup asciidoctor
	au!
	au BufEnter *.adoc,*.asciidoc call AsciidoctorMappings()
augroup END

" jinja templates
autocmd BufNewFile,BufRead *.j2 set syntax=jinja

" terraform
let g:terraform_align=1
let g:terraform_fold_sections=1
let g:terraform_fmt_on_save=0

" go config for tagbar (needs gotags)
let g:tagbar_type_go = {
	\ 'ctagstype' : 'go',
	\ 'kinds'     : [
		\ 'p:package',
		\ 'i:imports:1',
		\ 'c:constants',
		\ 'v:variables',
		\ 't:types',
		\ 'n:interfaces',
		\ 'w:fields',
		\ 'e:embedded',
		\ 'm:methods',
		\ 'r:constructor',
		\ 'f:functions'
	\ ],
	\ 'sro' : '.',
	\ 'kind2scope' : {
		\ 't' : 'ctype',
		\ 'n' : 'ntype'
	\ },
	\ 'scope2kind' : {
		\ 'ctype' : 't',
		\ 'ntype' : 'n'
	\ },
	\ 'ctagsbin'  : 'gotags',
	\ 'ctagsargs' : '-sort -silent'
\ }

" snipmate config
let g:snipMate = { 'snippet_version': 1 }

" set the runtime path to include Vundle and initialize
filetype off
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
if exists(':Plugin')
    Plugin 'Valloric/YouCompleteMe'
    Plugin 'plasticboy/vim-markdown'
    Plugin 'godlygeek/tabular'
    Plugin 'tpope/vim-fugitive'
    Plugin 'airblade/vim-gitgutter'
    Plugin 'vim-syntastic/syntastic'
    Plugin 'scrooloose/nerdtree'
    Plugin 'jistr/vim-nerdtree-tabs'
    Plugin 'Xuyuanp/nerdtree-git-plugin'
    Plugin 'flazz/vim-colorschemes'
    Plugin 'majutsushi/tagbar'
    Plugin 'xolox/vim-misc'
    Plugin 'xolox/vim-easytags'
    Plugin 'Raimondi/delimitMate'
    Plugin 'habamax/vim-asciidoctor'
    Plugin 'psf/black', { 'branch': 'stable' }
    Bundle 'Rykka/riv.vim'
    Plugin 'powerline/powerline-fonts'
    Plugin 'https://github.com/Glench/Vim-Jinja2-Syntax.git'
    Plugin 'hashivim/vim-terraform'
    Plugin 'andrewstuart/vim-kubernetes'
    Plugin 'ekalinin/Dockerfile.vim'
    Plugin 'https://github.com/moll/vim-bbye.git'
    Plugin 'MarcWeber/vim-addon-mw-utils'
    Plugin 'tomtom/tlib_vim'
    Plugin 'garbas/vim-snipmate'
    Plugin 'honza/vim-snippets'
    Plugin 'fatih/vim-go'
    Plugin 'jiangmiao/auto-pairs'
endif
" All of your Plugins must be added before the following line
call vundle#end()

" * Text Formatting -- Specific File Formats

" enable filetype detection:
filetype on
filetype plugin indent on

" for C-like programming, have automatic indentation:
autocmd FileType c,cpp,slang set cindent

" for actual C (not C++) programming where comments have explicit end
" characters, if starting a new line in the middle of a comment automatically
" insert the comment leader characters:
autocmd FileType c set formatoptions+=ro

" for Perl programming, have things in braces indenting themselves:
autocmd FileType perl set smartindent

" for CSS, also have things in braces indented:
autocmd FileType css set smartindent

" for HTML, generally format text, but if a long line has been created leave it
" alone when editing:
autocmd FileType html set formatoptions+=tl

" for both CSS and HTML, use genuine tab characters for indentation, to make
" files a few bytes smaller:
autocmd FileType html,css set noexpandtab tabstop=2

" in makefiles, don't expand tabs to spaces, since actual tab characters are
" needed, and have indentation at 8 chars to be sure that all indents are tabs
" (despite the mappings later):
autocmd FileType make set noexpandtab shiftwidth=8

" python
autocmd FileType python let python_highlight_all=1
autocmd FileType python set foldmethod=indent
autocmd FileType python set shiftwidth=4
autocmd FileType python set expandtab

" ruby
autocmd FileType ruby set foldmethod=indent
autocmd FileType ruby set shiftwidth=2

" C
autocmd FileType C set expandtab
autocmd FileType C set foldmethod=indent

" C++
autocmd FileType C++ set expandtab
autocmd FileType C++ set foldmethod=indent

" Puppet
au BufRead,BufNewFile *.pp set shiftwidth=2

" YAML
autocmd FileType yaml set foldmethod=indent
au BufRead,BufNewFile *.yml set shiftwidth=2
au BufRead,BufNewFile *.yaml set shiftwidth=2

" JSON
autocmd FileType json set foldmethod=syntax
au BufRead,BufNewFile *.json set shiftwidth=2
au BufRead,BufNewFile *.json set shiftwidth=2

" Groovy
autocmd FileType groovy set foldmethod=syntax
au BufRead,BufNewFile *.groovy set shiftwidth=2
au BufRead,BufNewFile *.groovy set shiftwidth=2

" prepend bbye to runtimepath
set runtimepath^=~/.vim/bundle/bbye
